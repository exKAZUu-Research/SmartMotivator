class QuizExcelImporter
  attr_reader :course_key, :course_attributes, :genres, :quizzes_list, :quiz_genres

  def initialize(course_key)
    @course_key = course_key
    @course_attributes = {}
    @genres = []
    @quizzes_list = []
    @quiz_genres = []
  end

  def parse_course(sheet)
    row_range = (sheet.first_row .. sheet.last_row)
    col_range = (sheet.first_column .. sheet.last_column)

    row_range.each do |y|
      col_range.each do |x|
        cell = sheet.cell(y, x)
        case cell
        when 'label'
          @course_attributes[:label] = sheet.cell(y, x + 1) if col_range.include?(x + 1)
        end
      end
    end
  end

  GENRE_FIELDS = %i(key label ordering quiz_size)
  def parse_genre(sheet)
    sheet.each(GENRE_FIELDS.map { |v| [v, v.to_s] }.to_h).with_index do |hash, index|
      next if index == 0
      genre = hash.slice(*GENRE_FIELDS).compact
      next unless genre[:key]
      @genres << genre
    end
  end

  QUIZ_FIELDS = %i(
    key label sub_label pre_text problem input_type answer_size correct_index
    shuffle commentary_label commentary default_percentage font
  )
  def parse_quiz(sheet)
    row_range = (sheet.first_row .. sheet.last_row)
    col_range = (sheet.first_column .. sheet.last_column)
    key_column = col_range.find { |col| sheet.cell(row_range.min, col).try(:strip) == 'key' }
    return unless key_column

    answer_columns = col_range.find_all do |col|
      /^answers?(-.+)?$/ =~ sheet.cell(row_range.min, col).try(:strip)
    end
    answers_list = row_range.each_with_object({}) do |row, hash|
      key = sheet.cell(row, key_column)
      answers = answer_columns.map { |col| sheet.cell(row, col) }
      hash[key] = answers
    end

    quizzes = []
    quiz_fields_set = QUIZ_FIELDS.map(&:to_s).to_set
    quiz_columns = col_range.each_with_object({}) do |col, hash|
      col_name = sheet.cell(row_range.min, col).try(:strip)
      hash[col_name.to_sym] = col if quiz_fields_set.include? col_name
    end
    row_range.each_with_index do |row, index|
      next if index == 0
      quiz = quiz_columns.map { |k, col| [k, sheet.cell(row, col)] }.to_h
      quiz.compact!
      next unless quiz[:key]
      answers = answers_list[quiz[:key]]
      quiz[:answers] = shrink(answers) if answers
      quizzes << Quiz.new(quiz)
    end
    quizzes_list << quizzes if quizzes.size > 0

    genre_key_column = col_range.find { |col| sheet.cell(row_range.min, col) == 'genre_key' }
    if genre_key_column
      row_range.each_with_index do |row, index|
        next if index == 0
        quiz_key = sheet.cell(row, key_column)
        genre_key = sheet.cell(row, genre_key_column)
        quiz_genres << { quiz_key: quiz_key, genre_key: genre_key } if quiz_key && genre_key
      end
    end
  end

  def shrink(array)
    index = array.rindex(&:present?)
    index ? array[0..index] : []
  end

  def execute
    Quiz.transaction do
      Course.where(key: course_key).update_all(course_attributes) unless course_attributes.empty?

      Genre.where(course_key: course_key).delete_all
      Quiz.where(course_key: course_key).delete_all
      QuizGenre.where(course_key: course_key).delete_all

      Genre.import(genres.map { |h| h.merge(course_key: course_key) })
      quizzes_list.each do |quizzes|
        quizzes.each { |q| q.course_key = course_key }
        Quiz.import(quizzes)
      end
      QuizGenre.import(quiz_genres.map { |h| h.merge(course_key: course_key) })
    end
    nil
  end

  def self.import(course_key, file)
    f = Roo::Spreadsheet.open(file)
    obj = self.new(course_key)
    f.each_with_pagename do |name, sheet|
      case name
      when 'course'
        obj.parse_course sheet
      when 'genre'
        obj.parse_genre sheet
      when /^quiz(-.+)?$/
        obj.parse_quiz sheet
      end
    end
    obj.execute
  end

  def self.export(course_key)
    return unless defined?(::Axlsx)
    course = Course.find_by_key!(course_key)
    Axlsx::Package.new do |p|
      # p.use_shared_strings = true
      wrap = p.workbook.styles.add_style alignment: { wrap_text: true }
      p.workbook.add_worksheet(name: "course") do |sheet|
        sheet.add_row(["label", course.label])
      end
      genres = course.genres.order(:ordering).to_a
      p.workbook.add_worksheet(name: "genre") do |sheet|
        sheet.add_row(GENRE_FIELDS)
        genres.each do |g|
          sheet.add_row(GENRE_FIELDS.map { |f| g[f] })
        end
      end
      dummy = Quiz.new
      genres.each do |g|
        sheet_name = "quiz-#{g.key}".gsub('_', '-')
        quizzes = Quiz.course_genre(course_key, g.key)
        # 列ラベル
        n_answers = quizzes.map { |q| q.answers.size }.max
        base_fields = QUIZ_FIELDS.find_all { |f|
          default_value = dummy[f]
          quizzes.any? { |q| q[f] != default_value }
        }
        fields = base_fields.dup
        fields.insert(1, 'genre_key')
        answer_ix = fields.index(:input_type)
        answers = n_answers == 1 ? ['answer'] : n_answers.times.map { |n| "answers-#{n}" }
        fields.insert(answer_ix, *answers)

        p.workbook.add_worksheet(name: sheet_name) do |sheet|
          sheet.add_row(fields)
          quizzes.each do |q|
            row = base_fields.map { |f| q[f] }
            row.insert(1, g.key)
            ans = q.answers + Array.new(n_answers - q.answers.size, nil)
            row.insert(answer_ix + 1, *ans)
            sheet.add_row(row, style: wrap)
          end
        end
      end
      yield p.to_stream.read
    end
  end
end
