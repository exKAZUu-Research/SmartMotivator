module QuizImporter
  JP_SEASON = %w(冬 春 夏 秋)

  module_function

  def import_all_quizzes
    count = 0
    t = Time.now
    Rails.logger.info '== Start importing quiz'
    Course.where(editable: false).update_all(editable: true)
    count += import_ngsl
    count += import_itpassport
    count += import_informatics
    Rails.logger.info "== Finish importing: %d quizzez, takes %.2f sec" % [count, Time.now - t]
  end

  def import_ngsl
    count = 0
    with_quiz 'english', '英単語' do |course_key|
      {
        ngsl_easy_1: '初級１',
        ngsl_easy_2: '初級２',
        ngsl_easy_3: '初級３',
        ngsl_normal_1: '中級１',
        ngsl_normal_2: '中級２',
        ngsl_normal_3: '中級３',
        ngsl_normal_4: '中級４',
        ngsl_hard: '上級',
      }.each_with_index do |(genre_key, label), index|
        Genre.create!(
          key: genre_key,
          course_key: course_key,
          label: "英単語 #{label}",
          ordering: index + 1,
          quiz_size: 10,
        )
        data = YAML.load(File.read("#{genre_key}.yml"))
        records = data.map do |quiz_key, *answers|
          q = Quiz.new(
            key: quiz_key,
            course_key: course_key,
            label: quiz_key,
            pre_text: '単語の意味を答えなさい。',
            problem: quiz_key,
            input_type: 'text',
            answers: answers,
            answer_size: answers.size,
            correct_index: 0,
            shuffle: true,
            commentary: "http://ejje.weblio.jp/content/#{quiz_key}",
          )
        end
        count += import_quizzes(course_key, genre_key, records)
      end
    end
    return count
  end

  def import_itpassport
    count = 0
    with_quiz 'itpassport', 'ITパスポート' do |course_key|
      Dir.glob('itpass_*.yml').each do |f|
        genre_key = File.basename(f, '.*')
        _, year, season = genre_key.split('_')
        year = year.to_i
        season_index = season_word_to_index(season)

        genre_label = "ITパスポート #{year}年#{JP_SEASON[season_index]}"
        Genre.create!(
          key: genre_key,
          course_key: course_key,
          label: genre_label,
          ordering: year * 4 + season_index,
          quiz_size: 5,
        )
        data = YAML.load(File.read(f))
        records = data.map do |yml_data|
          index = yml_data['key'][/\d+$/]
          images = {}
          yml_data['problem'].scan /\[img:(.+?)\]/ do |key,|
            img_path = file_path("/quiz_image/#{course_key}/#{key}.png")
            images[key] = img_path if img_path
          end
          q = Quiz.new(
            course_key: course_key,
            key: yml_data['key'],
            label: genre_label + " 午前%03d" % index.to_i,
            problem: yml_data['problem'],
            input_type: 'kana',
            answer_size: 4,
            correct_index: yml_data['correctAnswerIndex'],
            shuffle: false,
            commentary: yml_data['explanation'],
            images: images,
          )
        end
        count += import_quizzes(course_key, genre_key, records)
      end
    end
    return count
  end

  def import_informatics
    count = 0
    with_quiz 'informatics', '基本情報試験対策' do |course_key|
      Dir.glob('it_*.yml').each do |f|
        genre_key = File.basename(f, '.*')
        _, year, season = genre_key.split('_')
        year = year.to_i
        season_index = season_word_to_index(season)

        genre_label = "基本情報 #{year}年#{JP_SEASON[season_index]}"
        Genre.create!(
          key: genre_key,
          course_key: course_key,
          label: genre_label,
          ordering: year * 4 + season_index,
          quiz_size: 5,
        )
        data = YAML.load(File.read(f))
        records = data.map do |yml_data|
          index = yml_data['key'][/\d+$/]
          images = {}
          yml_data['problem'].scan /\[img:(.+?)\]/ do |key,|
            img_path = file_path("/quiz_image/#{course_key}/#{key}.png")
            images[key] = img_path if img_path
          end
          q = Quiz.new(
            course_key: course_key,
            key: yml_data['key'],
            label: genre_label + " 午前%02d" % index.to_i,
            problem: yml_data['problem'],
            input_type: 'kana',
            answer_size: 4,
            correct_index: yml_data['correctAnswerIndex'],
            shuffle: false,
            commentary: yml_data['explanation'],
            images: images,
          )
        end
        count += import_quizzes(course_key, genre_key, records)
      end
    end
    return count
  end

  def import_dummy_data
    c, genre_key = Study::COURSE_AND_GENRE_FOR_TEST
    with_quiz(c, 'Dummy Course') do |course_key|
      Genre.create!(key: genre_key, course_key: course_key, label: 'Dummy Genre')
      q = Quiz.new(
        course_key: course_key,
        key: 'dummy-quiz',
        label: 'Dummy Quiz',
        problem: '1 + 1 = ?',
        input_type: 'text',
        answers: ['2']
      )
      import_quizzes(course_key, genre_key, [q])
    end
  end

  def with_quiz(course_key, label)
    Rails.logger.info course_key
    Dir.chdir(Rails.root + '../quiz') do
      Quiz.transaction do
        delete_all(course_key)
        Course.create!(key: course_key, label: label)
        yield course_key
      end
    end
  end

  def delete_all(course_key)
    Course.where(key: course_key).delete_all
    Genre.where(course_key: course_key).delete_all
    Quiz.where(course_key: course_key).delete_all
    QuizGenre.where(course_key: course_key).delete_all
  end

  def file_path(path)
    resolved_path = "#{Rails.root}/public#{path}"
    return path if File.exist?(resolved_path)
    Rails.logger.warn "\033[31mNotFound: #{path}\033[0m"
    nil
  end

  def import_quizzes(course_key, genre_key, quizzes)
    Quiz.import(quizzes)
    QuizGenre.import(quizzes.map { |q|
      QuizGenre.new(course_key: course_key, genre_key: genre_key, quiz_key: q.key)
    })
    quizzes.size
  end

  def delete_old_studies
    sql = <<~SQL
      DELETE FROM studies s
      WHERE
          s.course IN (SELECT key FROM courses)
        AND
          (s.course, s.genre, s.quiz_key) NOT IN (
            SELECT course_key, genre_key, quiz_key FROM quiz_genres
          )
    SQL
    ActiveRecord::Base.connection.execute(sql)
  end

  def season_word_to_index(word)
    case word.downcase
    when 'winter'; 0
    when 'spring'; 1
    when 'summer'; 2
    when 'autumn'; 3
    end
  end
end
