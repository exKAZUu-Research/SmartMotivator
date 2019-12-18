# == Schema Information
#
# Table name: quizzes
#
#  id                 :uuid             not null, primary key
#  key                :string           not null
#  course_key         :string           not null
#  label              :string           not null
#  sub_label          :string
#  pre_text           :string
#  problem            :string           not null
#  input_type         :string           not null
#  answers            :string           default([]), not null, is an Array
#  answer_size        :integer          default(0), not null
#  correct_index      :integer          default(0), not null
#  shuffle            :boolean          default(FALSE), not null
#  commentary_label   :string
#  commentary         :string
#  default_percentage :integer
#  font               :string
#  images             :jsonb            not null
#
# Indexes
#
#  index_quizzes_on_course_key_and_key  (course_key,key) UNIQUE
#

class Quiz < ApplicationRecord
  Memorized = Struct.new(:key, :label, :memorized, :consecutive_correct_count)

  scope :course_genre, ->(course_key, genre_key) {
    keys = QuizGenre.select_quiz_keys(course_key, genre_key)
    where(course_key: course_key, key: keys)
  }

  def self.choose(user, course_key, genre_key, now)
    course = Course.find_by_key!(course_key)
    genre = course.genres.find_by_key!(genre_key)
    count = genre.quiz_size
    # count = 2 if Rails.env.development? && /dev/i !~ course_key
    chosen_keys = choose_keys_queue_leitner(user.id, course_key, genre_key, count, now)
    quizzes = Quiz.where(course_key: course_key, key: chosen_keys).to_a
    quizzes_json = Study.with_counts(course_key, quizzes)
    label_map = Genre.labels(course_key, genre_key, chosen_keys)
    quizzes_json.each do |j|
      j[:hijack] = label_map[j["key"]]
    end
    return quizzes_json
  end

  def self.choose_keys_queue_leitner(user_id, course_key, genre_key, count, now)
    all_quiz_keys = QuizGenre.where(course_key: course_key, genre_key: genre_key).pluck(:quiz_key)
    return all_quiz_keys if all_quiz_keys.size <= count

    target_scope = Study.selectable(user_id, course_key, genre_key)
    unseen_quiz_keys = all_quiz_keys - target_scope.pluck(:quiz_key)

    sampled_review_keys = LeitnerQueueService.quizzes_per_box(Study::NB_LEITNER_BOXES, count) \
      .flat_map do |box_index, nb_samples|
      if box_index == 0
        # we need to sample from quizzes that were never seen before
        unseen_quiz_keys.sample(nb_samples)
      else
        target_scope.in_leitner_box(box_index).limit(nb_samples).pluck(:quiz_key)
      end
    end

    # we should take quizzes from the most likely boxes first
    unsampled_review_keys = (0..Study::NB_LEITNER_BOXES).to_a \
      .flat_map do |box_index|
      if box_index == 0
        unseen_quiz_keys.shuffle
      else
        target_scope.in_leitner_box(box_index).pluck(:quiz_key)
      end
    end \
      .select { |quiz_key| !sampled_review_keys.include?(quiz_key) }

    memorized_keys =
      target_scope.in_leitner_box(Study::MEMORIZED_BOX_INDEX).pluck(:quiz_key)

    final_quiz_keys = (sampled_review_keys +
      unsampled_review_keys +
      memorized_keys).to_set.take(count)

    return final_quiz_keys
  end

  def self.memorized(user, course_key, genre_key)
    keys = QuizGenre.select_quiz_keys(course_key, genre_key)
    key_to_label = Quiz.course_genre(course_key, genre_key).pluck(:key, :label).to_h
    Study
      .where(user_id: user.id, course: course_key, quiz_key: keys)
      .pluck(:quiz_key, :memorized, :consecutive_correct_count)
      .map { |key, memo, count| Memorized.new(key, key_to_label[key], memo, count) }
  end
end
