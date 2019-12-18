module MissionHelper
  def get_mission(id)
    get "/mission.json?userId=#{id}"
    assert_response :success
    return JSON.parse(response.body)
  end

  def post_mission(id, answers)
    post "/mission.json", as: :json, params: {
      userId: id,
      answers: answers,
    }
    assert_response :success
    return JSON.parse(response.body)
  end
end
