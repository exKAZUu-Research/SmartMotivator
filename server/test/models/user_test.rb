require 'set'
require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def test_randomize_setting_should_log
    user_id = SecureRandom.uuid
    user = User.create!(id: user_id, name: 'Tarou', ready: true)
    dumps = UserData.where(user_id: user.id, kind: UserData::KIND_LOG_SETTING)
    assert_equal 1, dumps.count

    setting = user.setting
    data = dumps.last.value
    assert_equal 'create', data['event']
    assert_equal setting, data['setting']
  end

  def test_generate_missing_histories
    u = User.create!(course: User::COURSE_IT);
    assert_equal 0, StudyHistory.count

    u.update!(ready: true)
    assert_equal 2, StudyHistory.count

    u.update!(name: 'Jiro')
    assert_equal 2, StudyHistory.count

    u.update!(course: User::COURSE_ENGLISH)
    assert_equal 4, StudyHistory.count
  end
end
