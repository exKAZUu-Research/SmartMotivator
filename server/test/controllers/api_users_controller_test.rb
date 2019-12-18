require "test_helper"

class ApiUsersControllerTest < ActionDispatch::IntegrationTest
  def test_no_user
    user_id = SecureRandom.uuid
    get "/users/#{user_id}.json"
    assert_response :not_found
  end

  def test_start
    u = User.create!(name: 'Taro', course: User::COURSE_ENGLISH)
    time_msec = Time.current.to_i * 1000
    answers = Array.new(91, 2)

    # send survey
    user_data = { kind: 'survey', value: answers.to_json, userId: u.id, time_msec: time_msec }
    post '/user_data.json', params: { data: [user_data] }.as_json
    assert_response :success
    attributes = { startedAt: time_msec, finishedAt: time_msec }
    put "/users/#{u.id}.json", params: { survey: attributes }.as_json
    assert_response :success

    u.reload
    assert_not_nil u.survey_finished_at
    assert_not_empty u.user_data.surveys

    # start app
    put "/users/#{u.id}.json", params: { user: { ready: true } }.as_json
    assert_response :success
  end

  def test_exist_user
    user_id = SecureRandom.uuid
    name = "Taro"
    post "/users.json", params: { user: { id: user_id, name: name } }.as_json
    assert_response :success
    get "/users/#{user_id}.json"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal user_id, json["id"]
    assert_equal name, json["name"]
    assert_equal Hash.new, json["setting"]

    put "/users/#{user_id}.json", params: { user: { ready: true } }.as_json
    assert_response :success
    get "/users/#{user_id}.json"
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal user_id, json["id"]
    assert_equal name, json["name"]
    assert_equal Set.new(User::DEFAULT_SETTING.keys.map(&:to_s)), Set.new(json['setting'].keys)

    dumps = UserData.where(user_id: user_id, kind: UserData::KIND_LOG_SETTING)
    assert_equal 1, dumps.count
  end

  def test_update_settings
    user_id = SecureRandom.uuid
    dumps = UserData.where(user_id: user_id, kind: UserData::KIND_LOG_SETTING)

    # -- create user but no setting
    post "/users.json", params: { user: { id: user_id, name: "Taro" } }.as_json
    assert_response :success
    assert_equal 0, dumps.count

    user = User.find(user_id)

    # -- generate setting
    put "/users/#{user_id}.json", params: { user: { ready: true } }.as_json
    assert_response :success
    assert_equal 1, dumps.count

    setting = user.reload.setting
    data = dumps.last.value
    assert_equal 'create', data['event']
    assert_equal setting, data['setting']
  end

  def test_search_yourself
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')

    obj = get_search_query(login_user.id, 'Taro')
    assert_empty obj, "Search result must be null (didn't search yourself)"
  end

  def test_search_mismatch
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')
    dumb_users = create_test_user(size: 5)

    # Using query from test_helper
    obj = get_search_query(login_user.id, 'CAt')
    assert_empty obj, "Result must be empty (query mismatch)"
  end

  def test_search_case_insensitive
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')
    dumb_users = create_test_user(size: 5)

    # Using query from test_helper
    obj = get_search_query(login_user.id, 'uSeR')

    # Check amount of retrieved users
    assert_equal 5, obj.length, "Only #{5 / 2} person are in the same course"

    obj = obj.sort_by { |o| o['name'] }

    # Compare id
    obj.length.times do |i|
      assert_equal dumb_users[i]['id'], obj[i]['id'], "ID must be the same after sort the retrieved object"
    end
  end

  def test_list_followee_empty
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')

    obj = get_list_followee(login_user.id)
    assert_not_empty obj, "Should not empty (must be at least yourself)"
    assert_equal login_user.id, obj[0]['id'], "Retrieved Id must equal to login user"
  end

  def test_toggle_follow
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')
    dumb_user = create_test_user(name: 'Nobita')

    assert_not_equal login_user.id, dumb_user.id, "2 User must have different id"

    # login_user follow dumb_user
    obj = put_toggle_follow(login_user.id, dumb_user.id)
    assert obj['followed'], "Followed must be true (Login user already followed dumb user)"

    # login_user unfollow dumb_user
    obj = put_toggle_follow(login_user.id, dumb_user.id)
    assert_not obj['followed'], "Followed must be false (Login user already unfollowed dumb user)"
  end

  def test_list_followee_not_empty
    # Setup from test_helper
    login_user = create_test_user(name: 'Taro')
    dumb_users = create_test_user(size: 5)

    dumb_users.each do |du|
      obj = put_toggle_follow(login_user.id, du.id)
      assert obj['followed'], "Followed must be true (Login user already followed dumb user)"
    end

    obj = get_list_followee(login_user.id)
    assert_equal dumb_users.length + 1, obj.length, "Retrieved object = dumb user + yourself"
  end

  def test_show_user_details
    login_user = create_test_user(name: 'Taro')
    dumb_user = create_test_user(name: 'Nobita')

    obj = get_user_details(login_user.id, dumb_user.id)

    assert_not_empty obj, "Retrieved object shouldn'tbe empty"
    assert_equal dumb_user.id, obj['id'], "dumb user's id must be the same"
    assert_equal dumb_user.name, obj['name'], "dumb user's name must be the same"
    assert_not obj['followed'], "dumb user must not followed by login user"
    assert_not_nil obj['correctAns'], "Correct Answer must not be nil"
    assert_not_nil obj['percentCorrectAns'], "Percent Correct Answer must not be nil"
    assert_not_nil obj['avgSpeed'], "Average Speed must not be nil"
  end

  def test_retrieved_introduction
    login_user = create_test_user(name: 'Taro')
    obj = get_user_info(login_user.id)
    assert_equal login_user.introduction, obj['introduction'], "Retrieved introduction must equal to the setter"
    assert_empty obj['introduction'], "Default introduction value is empty"
  end

  def test_assign_introduction
    login_user = create_test_user(name: 'Taro')
    introduction_text = 'Happiness'
    obj = update_user_introduction(login_user.id, introduction_text)
    obj = get_user_info(login_user.id)
    assert_not_empty obj['introduction'], "Introduction value shouldn't be empty because it has been set already"
    assert_equal introduction_text, obj['introduction'], "Retrieved introduction must equal to the setter"
  end

  def test_toggle_muted
    login_user = create_test_user(name: 'Taro')
    dumb_user = create_test_user(name: 'Nobita')

    assert_empty Mute.where(muter_id: login_user.id, mutee_id: dumb_user.id), "Must empty. Didn't mute yet"

    #to mute
    obj = put_toggle_muted(login_user.id, dumb_user.id)
    assert_not_empty Mute.where(muter_id: login_user.id, mutee_id: dumb_user.id), "Must not empty. Already muted"

    #to unmute
    obj = put_toggle_muted(login_user.id, dumb_user.id)
    assert_empty Mute.where(muter_id: login_user.id, mutee_id: dumb_user.id), "Must empty. Unmuted already"
  end

  def create_test_user(size: nil, **opts)
    users = []
    (size || 1).times do |n|
      users << User.create!({
        id: SecureRandom.uuid,
        name: "User #{n}",
        course: User::COURSE_ENGLISH,
        ready: true,
      }.merge(opts))
    end
    return size ? users : users.first
  end

  def gen_data(user_id, time, kind, value)
    return {
      userId: user_id,
      kind: kind,
      value: (String === value) ? value : value.as_json.to_json,
      time_msec: time.to_i * 1000,
    }
  end
end
