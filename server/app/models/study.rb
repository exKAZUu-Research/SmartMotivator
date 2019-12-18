# == Schema Information
#
# Table name: studies
#
#  id                        :integer          not null, primary key
#  user_id                   :uuid             not null
#  course                    :string           not null
#  quiz_key                  :string           not null
#  total_count               :integer          default(0), not null
#  consecutive_correct_count :integer          default(0), not null
#  available_at              :datetime         not null
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  correct_count             :integer          default(0), not null
#  genre                     :string           not null
#  leitner_box               :integer          default(0), not null
#  memorized                 :boolean          default(FALSE), not null
#
# Indexes
#
#  index_studies_on_user_id_and_course_and_genre_and_quiz_key  (user_id,course,genre,quiz_key) UNIQUE
#

class Study < ApplicationRecord
  Answer = Struct.new(:quiz_key, :correct, :spent_time)
  Stats = Struct.new(:memorized, :correct, :answered, :total)

  RETENTION_INTERVAL = 3
  STUDY_INTERVAL = 3
  NB_LEITNER_BOXES = 3
  MEMORIZED_BOX_INDEX = NB_LEITNER_BOXES + 1

  COURSE_AND_GENRE_FOR_TEST = ['test', 'dummy']

  scope :selectable, -> (user_id, course, genre)  { where(user_id: user_id, course: course, genre: genre) }
  scope :memorized, -> { where('memorized = ?', true) }
  scope :unmemorized, -> { where('memorized = ?', false) }
  scope :available, ->(now) { where('available_at <= ?', now) }
  scope :unavailable, ->(now) { where('available_at > ?', now) }
  scope :correct_some, -> { where('correct_count > 0') }
  scope :in_leitner_box, ->(box_index) {
    where('leitner_box = ?', box_index)
    .order(:updated_at)
  }

  belongs_to :user, optional: true

  def memorized?
    self.memorized
  end

  def self.create_once(user_id, course, genre, quiz_key)
    where(user_id: user_id, course: course, genre: genre, quiz_key: quiz_key).find_or_create_by!({})
  end

  def self.with_counts(course, quizzes)
    keys = quizzes.map(&:key)
    correct_hash = Study.where(quiz_key: keys).group(:quiz_key).sum(:correct_count)
    total_hash = Study.where(quiz_key: keys).group(:quiz_key).sum(:total_count)
    correct_hash.default = 0
    total_hash.default = 0

    quizzes.map { |q|
      q.as_json.merge(correct_count: correct_hash[q.key], total_count: total_hash[q.key])
    }
  end

  def self.update_studies(user, course, genre, answers, now)
    scope = selectable(user.id, course, genre)

    correct_count_func = -> { Study.where(user_id: user.id, course: course).correct_some.count }
    before_total_correct_count = correct_count_func.call
    values = answers.map { |a| scope.build(quiz_key: a.quiz_key, available_at: now) }
    Study.import(values, on_duplicate_key_ignore: true)

    transaction do
      total_count = 0
      correct_count = 0
      spent_time = 0
      memorized_word = 0

      result_list = answers.map do |answer|
        record = scope.find_by_quiz_key!(answer.quiz_key)
        dir = record.update_by_answer_queue_leitner(answer.correct)

        total_count += 1
        correct_count += 1 if answer.correct
        spent_time += answer.spent_time
        memorized_word += dir

        {
          quiz_key: record.quiz_key,
          memorized: dir,
        }
      end
      after_total_correct_count = correct_count_func.call

      completed_now = false
      if scope.memorized.count >= QuizGenre.select_quiz_keys(course, genre).count
        gc_scope = GenreCompletion.where(user_id: user.id, course: course, genre: genre)
        if gc_scope.empty?
          gc_scope.create({})
          completed_now = true
        end
      end

      # Update/Create relevant performance entries
      ## StudyHistory
      week_start = Calendar.start_of_week(now.to_date)
      hist = StudyHistory.create_once(user.id, course, week_start)
      hist.update_info(correct_count, total_count, spent_time, memorized_word)

      return {
        completed_now: completed_now,
        stats: result_list,
        before_total_correct_count: before_total_correct_count,
        after_total_correct_count: after_total_correct_count,
      }
    end
  end

  def update_by_answer_queue_leitner(correct)
    dir = 0
    if correct
      self.correct_count += 1
      self.consecutive_correct_count += 1
      self.leitner_box = (leitner_box + 1).clamp(2, MEMORIZED_BOX_INDEX)
      if self.leitner_box == MEMORIZED_BOX_INDEX
        self.memorized = true
        dir = 1
      end
    else
      self.consecutive_correct_count = 0
      self.leitner_box = [1, leitner_box - 1].max
      if self.memorized?
        self.memorized = false
        dir = -1
      end
    end
    self.total_count += 1
    self.save!
    dir
  end

  def self.all_course_and_genre
    group(:course, :genre).pluck(:course, :genre)
  end

  def self.stats(user_id)
    answered_triple = all
      .where(user_id: user_id)
      .group(:course, :genre)
      .pluck(:course, :genre, 'COUNT(quiz_key)')
    correct_triple = correct_some
      .where(user_id: user_id)
      .group(:course, :genre)
      .pluck(:course, :genre, 'COUNT(quiz_key)')
    memorized_triples = memorized
      .where(user_id: user_id)
      .group(:course, :genre)
      .pluck(:course, :genre, 'COUNT(quiz_key)')

    hash = Hash.new { |h, course| h[course] = Hash.new { |h2, genre| h2[genre] = Stats.new(0, 0, 0, 0) } }
    answered_triple.each do |course, genre, count|
      stats = hash[course][genre]
      stats.answered = count
      stats.total = QuizGenre.pluck_quiz_keys(course, genre).size
    end
    correct_triple.each do |course, genre, count|
      hash[course][genre].correct = count
    end
    memorized_triples.each do |course, genre, count|
      hash[course][genre].memorized = count
    end
    hash
  end
  # ---- Admin

  def self.reset_all(user)
    return 'No user' unless user

    count = transaction do
      GenreCompletion.where(user_id: user.id).delete_all
      Study.where(user_id: user.id).delete_all
    end
    "#{user.name} (#{user.id}): count = #{count}"
  end

  def self.answer_2(user)
    now = Time.current
    genre_list = []
    pairs = QuizGenre.where(course_key: user.course).pluck(:genre_key, :quiz_key)
    records = pairs.map do |(genre_key, quiz_key)|
      Study.new(
        user_id: user.id,
        course: user.course,
        genre: genre_key,
        quiz_key: quiz_key,
        available_at: now,
      )
    end
    Study.import(records, on_duplicate_key_ignore: true)

    sql = <<-SQL
      UPDATE studies
      SET
        total_count = total_count + 2,
        consecutive_correct_count = consecutive_correct_count + 2,
        correct_count = correct_count + 2
      WHERE
        user_id = '#{user.id}';
    SQL
    pg_result = ApplicationRecord.connection.execute(sql)
    cnt = pg_result.cmd_tuples

    "%s (%s): records = %d, course = %s, genres = [%s]" % [
      user.name,
      user.id,
      cnt,
      user.course,
      genre_list.join(', '),
    ]
  end
end
