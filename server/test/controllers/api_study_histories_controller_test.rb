require 'test_helper'

class ApiStudyHistoriesControllerTest < ActionDispatch::IntegrationTest
  def test_show
    user_id = SecureRandom.uuid
    User.create!(id: user_id, course: User::COURSE_ENGLISH)
    week_start = Calendar.start_of_week(Date.today)
    history = StudyHistory.create_once(user_id, User::COURSE_ENGLISH, week_start)

    # ---- ---- ---- ---- 学習データ無し ---- ---- ---- ----
    get '/study_histories.json', params: { userId: user_id }.as_json
    assert_response :success

    str_date = week_start.strftime('%Y-%m-%d')
    obj = JSON.parse(response.body)

    assert_equal 0, obj.dig(str_date, 'count', 'value')
    assert_equal 0, obj.dig(str_date, 'rate', 'value')
    assert_nil obj.dig(str_date, 'spentTime', 'value')

    assert_equal 1, obj.dig('all', 'count', 'rank') # 自分ひとりしかいないので 1位
    assert_equal 1, obj.dig('all', 'rate', 'rank')
    assert_equal 1, obj.dig('all', 'spentTime', 'rank')

    assert_nil obj.dig('all', 'count', 'score')
    assert_nil obj.dig('all', 'rate', 'score')
    assert_nil obj.dig('all', 'spentTime', 'score')

    # ---- ---- ---- ---- 学習データ有り ---- ---- ---- ----
    history.update!(correct_count: 8,
      total_count: 10,
      total_spent_time: 160,
      memorized_word: 3,
    )

    get '/study_histories.json', params: { userId: user_id }.as_json
    assert_response :success

    str_date = week_start.strftime('%Y-%m-%d')
    obj = JSON.parse(response.body)
    assert_equal 8, obj.dig(str_date, 'count', 'value')
    assert_equal 0.8, obj.dig(str_date, 'rate', 'value')
    assert_equal 16, obj.dig(str_date, 'spentTime', 'value')
    assert_equal 3, obj.dig(str_date, 'memorizedWord', 'value')

    assert_equal 1, obj.dig('all', 'count', 'rank') # 自分ひとりしかいないので 1位
    assert_equal 1, obj.dig('all', 'rate', 'rank')
    assert_equal 1, obj.dig('all', 'spentTime', 'rank')
    assert_equal 1, obj.dig('all', 'memorizedWord', 'rank')
  end

  def test_update_goal
    user_id = SecureRandom.uuid
    User.create!(id: user_id, course: User::COURSE_ENGLISH, ready: true)

    str_week_start = Calendar.start_of_week(Date.today).strftime('%Y-%m-%d')
    post '/study_histories.json', params: {
      userId: user_id,
      data: { str_week_start => {
        rate: { goal: 0.75 },
        count: { goal: 20 },
        spentTime: { goal: 11 },
        memorizedWord: { goal: 2 },
      } }
    }.as_json
    assert_response :success

    get '/study_histories.json', params: { userId: user_id }.as_json
    obj = JSON.parse(response.body)

    # ppp JSON.pretty_generate(obj)
    assert_equal 20, obj.dig(str_week_start, 'count', 'goal')
    assert_equal 0.75, obj.dig(str_week_start, 'rate', 'goal')
    assert_equal 11, obj.dig(str_week_start, 'spentTime', 'goal')
    assert_equal 2, obj.dig(str_week_start, 'memorizedWord', 'goal')
  end

  def test_update_goal_future
    user_id = SecureRandom.uuid
    User.create!(id: user_id, course: User::COURSE_ENGLISH)
    str_week_start = Calendar.start_of_week(Date.today, offset: 2).strftime('%Y-%m-%d')
    post '/study_histories.json', params: {
      userId: user_id,
      data: { str_week_start => {
        rate: { goal: 0.75 },
        count: { goal: 20 },
        spentTime: { goal: 11 },
        memorizedWord: { goal: 2 },
      } }
    }.as_json
    assert_response :success

    get '/study_histories.json', params: { userId: user_id }.as_json
    obj = JSON.parse(response.body)

    # puts JSON.pretty_generate(obj)
    assert_equal 20, obj.dig(str_week_start, 'count', 'goal')
    assert_equal 0.75, obj.dig(str_week_start, 'rate', 'goal')
    assert_equal 11, obj.dig(str_week_start, 'spentTime', 'goal')
    assert_equal 2, obj.dig(str_week_start, 'memorizedWord', 'goal')
  end
end
