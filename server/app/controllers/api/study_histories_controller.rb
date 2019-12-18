class API::StudyHistoriesController < API::BaseController
  def show
    # @show_json = true

    user_id = params['userId']
    this_week_start = Calendar.start_of_week(requested_at.to_date)

    user = User.find(user_id)
    stats = StudyStatsService.call(user.id, user.course, this_week_start)
    render_json stats
  end

  def create
    user_id = params['userId']
    user = User.find(user_id)
    data = params['data']
    StudyHistory.transaction do
      data.each do |key, value|
        week_start = Date.parse(key)
        next unless Calendar.start_of_week?(week_start)
        rate_goal = value.dig('rate', 'goal')
        count_goal = value.dig('count', 'goal')
        spent_time_goal = value.dig('spentTime', 'goal')
        memorized_word_goal = value.dig('memorizedWord', 'goal')

        record = StudyHistory.create_once(user.id, user.course, week_start)
        record.set_goal(rate_goal, count_goal, spent_time_goal, memorized_word_goal)
      end
    end

    head :no_content
  end
end
