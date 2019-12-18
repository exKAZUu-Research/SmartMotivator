require 'test_helper'

class StudyHistoryTest < ActiveSupport::TestCase
  def test_stats
    user_id = SecureRandom.uuid
    course = 'TEST'
    User.create!(id: user_id, course: course)
    week_start = Calendar.start_of_week(Date.today)
    hash = {
      user_id: user_id,
      course: course,
      week_start: week_start,
      correct_count: 8,
      total_count: 10,
      total_spent_time: 160,
    }

    StudyHistory.create!(hash)
    stats = StudyStatsService.call(user_id, course, week_start)
    assert_equal 8, stats['all'].count.value
    assert_equal 1, stats['all'].count.rank

    user2 = User.create!
    StudyHistory.create!(hash.merge user_id: user2.id, correct_count: 9)
    stats = StudyStatsService.call(user_id, course, week_start)
    assert_equal 2, stats['all'].count.rank

    StudyHistory.create!(hash.merge user_id: user2.id, correct_count: 9, course: 'another')
    stats = StudyStatsService.call(user_id, course, week_start)
    assert_equal 2, stats['all'].count.rank
  end
end
