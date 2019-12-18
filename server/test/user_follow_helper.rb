module UserFollowHelper
  def get_search_query(id, q)
    get "/users/#{id}/search.json?query=#{q}"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  def put_toggle_follow(follower_id, followee_id)
    put "/users/#{follower_id}/toggle_follow.json?follow_id=#{followee_id}"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  def get_list_followee(id)
    get "/users/#{id}/following.json"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  def get_user_details(id, selected_user_id)
    get "/users/#{id}/user_details.json?selected_user_id=#{selected_user_id}"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  #users_controller#show
  def get_user_info(id)
    get "/users/#{id}.json"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  #users_controller#update
  def update_user_introduction(id, introduction)
    params = { user: { introduction: introduction } }.as_json
    put "/users/#{id}.json", params: params
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end

  def put_toggle_muted(muter_id, mutee_id)
    put "/users/#{muter_id}/toggle_mute.json?mutee_id=#{mutee_id}"
    assert_response :success, "Connection error."
    return JSON.parse(response.body)
  end
end
