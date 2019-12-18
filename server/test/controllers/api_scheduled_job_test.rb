require "test_helper"

class ApiScheduledJobTest < ActionDispatch::IntegrationTest
  def test_run_screen_with_data
    user_1 = create_user()
    user_2 = create_user()
    time_start = Time.current

    # user_1
    data_1 = gen_data(user_1.id, "event", gen_event(time_start, 10, "mainScreen", "screen_view"))
    post_create_user_data_event(data_1)
    data_2 = gen_data(user_1.id, "event", gen_event(time_start, 9, "background", "screen_view"))
    post_create_user_data_event(data_2)
    data_3 = gen_data(user_1.id, "event", gen_event(time_start, 8, "mainScreen", "screen_view"))
    post_create_user_data_event(data_3)
    data_4 = gen_data(user_1.id, "event", gen_event(time_start, 7.5, "study_history/count", "screen_view"))
    post_create_user_data_event(data_4)
    data_5 = gen_data(user_1.id, "event", gen_event(time_start, 2, "background", "app"))
    post_create_user_data_event(data_5)

    # user_2
    data_6 = gen_data(user_2.id, "event", gen_event(time_start, 7.5, "study_history/count", "screen_view"))
    post_create_user_data_event(data_6)
    data_7 = gen_data(user_2.id, "event", gen_event(time_start, 6, "study_history/rate", "screen_view"))
    post_create_user_data_event(data_7)
    data_8 = gen_data(user_2.id, "event", gen_event(time_start, 5.5, "mainScreen", "screen_view"))
    post_create_user_data_event(data_8)
    data_9 = gen_data(user_2.id, "event", gen_event(time_start, 5, "study_history/rate", "screen_view"))
    post_create_user_data_event(data_9)
    data_10 = gen_data(user_2.id, "event", gen_event(time_start, 2, "background", "app"))
    post_create_user_data_event(data_10)

    # Run slack code without notification
    response = ScheduledJob.report_to_slack(notify: false)

    assert_equal 12, UserData.count
    begin
      # Users signed in
      assert response.include?("2 new users"), "response: #{response}"

      # check screen view results
      assert response.include?("3 times (2 users): mainScreen"), "response: #{response}" # all screen_view
      assert response.include?("1 times (1 users): mainScreen"), "response: #{response}" # constraint screen_view
      assert response.include?("2 times (1 users): study_history/rate"), "response: #{response}" # all screen_view
      assert response.include?("1 times (1 users): study_history/rate"), "response: #{response}" # constraint sv
      assert response.include?("2 times (2 users): study_history/count"), "response: #{response}" # all sv and c
      assert !(response.include? "1 times: background"), "response: #{response}" # none
    rescue MiniTest::Assertion

      raise
    end
  end

  # ---- ---- ---- ---- used by this class as helper ---- ---- ---- ---- #

  private

  def create_user()
    course = User::COURSE_ENGLISH
    User.create!(id: SecureRandom.uuid, course: course, ready: true, last_access: Time.current)
  end

  def gen_data(id, kind, value)
    return {
      userId: id,
      kind: kind,
      value: (String === value) ? value : value.as_json.to_json,
      time_msec: Time.current.to_i * 1000,
    }
  end

  def gen_event(time_start, factor, action, category)
    return {
      data: Time.at(time_start - ScheduledJob::SCREEN_VIEW_CONSTRAINT * factor),
      label: "null",
      action: action,
      category: category,
    }
  end
end
