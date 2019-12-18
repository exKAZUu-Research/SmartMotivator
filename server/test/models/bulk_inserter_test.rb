require 'test_helper'

class BulkInserterTest < ActiveSupport::TestCase
  def test_create_missing_study_histories
    10.times do
      User.create!(id: SecureRandom.uuid, course: User::COURSE_ENGLISH, ready: true)
    end
    assert_equal 20, StudyHistory.count

    StudyHistory.delete_all
    assert_equal 0, StudyHistory.count

    dates = [-1, 0].map { |offset| Calendar.start_of_week(Date.today, offset: offset) }
    BulkInserter.create_missing_study_histories(dates)
    assert_equal 20, StudyHistory.count

    BulkInserter.create_missing_study_histories(dates)
    assert_equal 20, StudyHistory.count

    dates = [-1, 0, 1].map { |offset| Calendar.start_of_week(Date.today, offset: offset) }
    BulkInserter.create_missing_study_histories(dates)
    assert_equal 30, StudyHistory.count
  end
end
