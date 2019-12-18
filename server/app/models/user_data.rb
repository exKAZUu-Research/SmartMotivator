# == Schema Information
#
# Table name: user_data
#
#  id         :integer          not null, primary key
#  user_id    :uuid             not null
#  kind       :string           not null
#  value      :jsonb            not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  time       :datetime         not null
#
# Indexes
#
#  index_user_data_on_kind_and_user_id  (kind,user_id)
#

class UserData < ApplicationRecord
  KIND_LOG_SETTING = "logSetting"
  KIND_LOG_COMPONENTS_FAVORITED = "logFavorites"
  KIND_SURVEY = "survey"
  KIND_QUIZ = "quiz"
  KIND_POINT = "point"
  KIND_EVENT = "event"

  DUMP_EVENT_CREATE = 'create'
  DUMP_EVENT_BY_BATCH = 'batch'
  DUMP_EVENT_BY_USER = 'user'

  scope :surveys, -> { where(kind: KIND_SURVEY) }
  scope :quizzes, -> { where(kind: KIND_QUIZ) }
  scope :points,  -> { where(kind: KIND_POINT) }
  scope :screen_views, -> { where(kind: KIND_EVENT).where("value->>'category' = ?", "screen_view").or(
                                            where(kind: KIND_EVENT).where("value->>'action' = ?", "background")) }
  scope :between, ->(start_time, end_time) { where("time > ? AND time < ?", start_time, end_time) }

  belongs_to :user, optional: true

  def current_time
    RequestStore.store[:requested_at] || Time.current
  end

  def self.all_kinds
    group(:kind).pluck(:kind)
  end

  def self.users_quiz_done_last_week(last_week)
    UserData
      .group(:user_id)
      .where(kind: 'quiz')
      .where('created_at >= ?', last_week)
      .count
  end

  def self.latest_quizzes_performance(user_id)
    quiz_info = quizzes
      .where(user_id: user_id)
      .order(time: :desc)
      .first(5)
      .pluck('value')
    performance_list = quiz_info.map do |q|
      q['answers'].map do |a|
        {
          correct: a['correct'],
          spent_time: a['spentTime'],
        }
      end
    end
    performance_list.flatten
  end
end
