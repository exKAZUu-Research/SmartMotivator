module ScheduledJobHelper
  def post_create_user_data_event(data)
    post '/user_data.json', params: {
      data: data.as_json,
    }
    assert_response :success
  end
end
