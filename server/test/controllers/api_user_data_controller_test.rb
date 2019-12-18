require 'test_helper'

class ApiUserDataControllerTest < ActionDispatch::IntegrationTest
  def test_post
    old_count = UserData.count
    post '/user_data.json', params: { data: [get_client_data, get_client_data].as_json }
    new_count = UserData.count

    assert_equal old_count + 2, new_count
  end

  private

  def get_client_data
    gen_data(SecureRandom.uuid, 'test', dummy: true)
  end

  def gen_data(user_id, kind, value)
    return {
      userId: user_id,
      kind: kind,
      value: (String === value) ? value : value.as_json.to_json,
      time_msec: Time.current.to_i * 1000,
    }
  end
end
