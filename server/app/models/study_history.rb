# == Schema Information
#
# Table name: study_histories
#
#  id                        :integer          not null, primary key
#  user_id                   :uuid             not null
#  week_start                :date             not null
#  rate_goal                 :float
#  count_goal                :integer
#  correct_count             :integer          default(0), not null
#  total_count               :integer          default(0), not null
#  cached                    :boolean          default(FALSE), not null
#  cache_rate_rank           :integer          default(0), not null
#  cache_count_rank          :integer          default(0), not null
#  spent_time_goal           :integer
#  total_spent_time          :integer          default(0), not null
#  cahce_spent_time_rank     :integer          default(0), not null
#  course                    :string           not null
#  memorized_word_goal       :integer
#  memorized_word            :integer          default(0), not null
#  cache_memorized_word_rank :integer          default(0), not null
#
# Indexes
#
#  index_study_histories_on_course_and_user_id_and_week_start  (course,user_id,week_start) UNIQUE
#  index_study_histories_on_week_start                         (week_start)
#

class StudyHistory < ApplicationRecord
  include SuperQuery

  scope :goal_not_nil, -> { where.not(count_goal: nil) }
  scope :achieved_goal, -> { goal_not_nil.where('correct_count >= count_goal') }
  scope :failed_goal, -> { goal_not_nil.where('correct_count < count_goal') }
  scope :uid_course, ->(uid, course) { where(user_id: uid, course: course) }

  belongs_to :user, optional: true

  def correct_rate
    total_count == 0 ? 0 : (1.0 * correct_count / total_count)
  end

  def spent_time
    total_count == 0 ? nil : (1.0 * total_spent_time / total_count)
  end

  def spent_time_for_calc
    -(total_count == 0 ? nil : (1.0 * total_spent_time / total_count))
  end

  def set_goal(rate_goal, count_goal, spent_time_goal, memorized_word_goal)
    self.rate_goal = rate_goal if rate_goal
    self.count_goal = count_goal if count_goal
    self.spent_time_goal = spent_time_goal if spent_time_goal
    self.memorized_word_goal = memorized_word_goal if memorized_word_goal
    save!
  end

  def update_info(correct_count, total_count, spent_time, memorized_word)
    self.total_count += total_count
    self.correct_count += correct_count
    self.total_spent_time += spent_time
    self.memorized_word += memorized_word
    self.save!
  end

  def self.last_week_correct(user_id, course, now)
    today = now.to_date
    week_start = Calendar.start_of_week(today, offset: -1) # Last week
    uid_course(user_id, course).where(week_start: week_start).pluck(:correct_count).first
  end

  def self.correct_average(user_id, course, now)
    today = now.to_date
    week_start = Calendar.start_of_week(today, offset: -1) # Last week
    uid_course(user_id, course).where('week_start <= ?', week_start).average(:correct_count).round(1)
  end

  def self.create_once(user_id, course, week_start)
    uid_course(user_id, course).where(week_start: week_start).find_or_create_by!({})
  end
end
