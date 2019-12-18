class API::MissionsController < API::BaseController
  BASE_REQUIRED_POINT_IN_LEVELS = [30, 70, 100, 120]

  RANKING_LEVEL_GROUPS = [0, 4, 6, 8, 10, 15, 20, 30, 50, 100]

  MissionGoals = Struct.new(
    :answer_count,
    :correct_count,
    :fast_correct_count,
    :memorized_count,
    :multi_correct_count,
    :multi_fast_correct_count,
    :answer_time_list,
    :answer_reward,
    :correct_reward,
    :fast_correct_reward,
    :memorized_reward,
    :multi_correct_reward,
    :multi_fast_correct_reward,
  )
  MISSION_GOALS = {
    User::COURSE_ENGLISH  => MissionGoals.new(10, 10, 10, 50, 8, 6, [2000, 4000, 6000], 10, 12, 15, 120, 40, 40),
    User::COURSE_IT       => MissionGoals.new(5, 4, 4, 6, 4, 3, [15000, 30000, 60000], 30, 36, 45, 110, 60, 60),
    User::COURSE_ITPASS   => MissionGoals.new(5, 4, 4, 6, 4, 3, [15000, 30000, 60000], 30, 36, 45, 110, 60, 60),
  }
  MISSION_GOALS.default = MISSION_GOALS[User::COURSE_ENGLISH]

  def show
    # @show_json = true
    user = User.find(params['userId'])
    mission = user.mission.presence || create_initial_mission_info(user)
    mission = fill_empty_missions(user, mission)
    mission = execute_periodic_process(user, mission)
    user.update_attributes(mission: mission)
    render_json mission.merge(point_json(user.id, user.point))
  end

  def create
    # @show_json = true
    user = User.find(params['userId'])
    answers = params['answers']

    mission_info = user.mission.presence || create_initial_mission_info(user)
    original_mission_info = mission_info.merge(point_json(user.id, user.point))
    mission_info_with_values_updated = update_mission_info_values(user, original_mission_info, answers)
    final_mission_info = update_mission_info_missions(user, mission_info_with_values_updated)

    mission_info_list = [
      original_mission_info,
      mission_info_with_values_updated,
      final_mission_info,
    ]
    User.transaction do
      user.update_attributes!(point: final_mission_info['point'], mission: final_mission_info.except('point'))
    end

    render_json mission_info_list
  end

  def ranking
    user = User.find(params['userId'])
    top = params['top'].try(:to_i) || 5
    around = params['around'].try(:to_i) || 5

    ranking_info = calc_ranking_info(user.point)
    min = ranking_info[:lower_bound]
    max = ranking_info[:upper_bound]

    tuple = PointRankingService.call(user, nil, top, around, min, max)
    ranking = {
      name: ranking_info[:name],
      top_users: tuple.top_users.map { |u| point_ranking_user_json(u) },
      rival_users: tuple.rival_users.try { |us| us.map { |u| point_ranking_user_json(u) } },
      rival_top_rank: tuple.rival_top_rank,
      hidden_rival_count: tuple.hidden_rival_count,
    }
    render_json ranking
  end

  def self_ranking
    user = User.find(params['userId'])
    size = params['size'].try(:to_i) || 10

    render_json create_ranking_from_history(user, requested_at, size)
  end

  private

  def point_json(user_id, point)
    ranking_info = calc_ranking_info(point)
    min = ranking_info[:lower_bound]
    max = ranking_info[:upper_bound]

    user_scope = User.where(ready: true).where.not(id: user_id)
    if max
      user_scope = user_scope.where(point: (min...max))
    else
      user_scope = user_scope.where('point >= ?', min)
    end
    upper_user_count = user_scope.where('point > ?', point).count
    rank = upper_user_count + 1

    mission_cleared_today = UserData
        .where(user_id: user_id, kind: 'mission')
        .where('time >= ?', requested_at.to_date)
        .exists?

    highscore_rank = calc_rank_from_history(user_id, point, requested_at.to_date)

    return {
      point: point,
      rank: rank,
      ranking_name: calc_ranking_info(point)[:name],
      highscore_rank: highscore_rank,
      mission_cleared_today: mission_cleared_today,
    }.merge(calc_level_info(point)).as_json
  end

  def point_ranking_user_json(user)
    {
      id: user.id,
      name: user.name,
      icon: user.icon,
      color: user.color,
      point: user.point,
    }
  end

  def calc_level_info(point)
    level = 1
    lower_bound = 0
    upper_bound = calc_required_point_in_level(level)
    while upper_bound <= point
      level += 1
      lower_bound = upper_bound
      upper_bound += calc_required_point_in_level(level)
    end

    {
      level: level,
      bonus: calc_point_bonus(level),
      level_point_range: { min: lower_bound, max: upper_bound },
    }
  end

  def accumulated_required_point(level)
    sum = 0
    level.times do |i|
      sum += calc_required_point_in_level(i + 1)
    end
    sum
  end

  def calc_required_point_in_level(level)
    index = [level, BASE_REQUIRED_POINT_IN_LEVELS.size].min - 1
    BASE_REQUIRED_POINT_IN_LEVELS[index] * calc_point_bonus(level)
  end

  def calc_point_bonus(level)
    if level <= 10
      bonus = 1.4**(level - 1)
    elsif level <= 20
      bonus = 1.4**9 * 1.3**(level - 10)
    elsif level <= 35
      bonus = 1.4**9 * 1.3**10 * 1.2**(level - 20)
    else
      bonus = 1.4**9 * 1.3**10 * 1.2**15
    end
    bonus.round(bonus < 10 ? 1 : 0)
  end

  def calc_ranking_info(point)
    info = calc_level_info(point)
    level = info[:level]

    index = RANKING_LEVEL_GROUPS.size
    RANKING_LEVEL_GROUPS.each_with_index do |n, i|
      if level <= n
        index = i
        break
      end
    end
    lower_level = RANKING_LEVEL_GROUPS[index - 1] + 1
    upper_level = RANKING_LEVEL_GROUPS[index]

    name =
      case
      when upper_level == nil
        "レベル#{lower_level}以上ランキング"
      when lower_level == upper_level
        "レベル#{upper_level}ランキング"
      else
        "レベル#{lower_level}～#{upper_level}内ランキング"
      end
    lower_bound = accumulated_required_point(lower_level - 1)
    upper_bound = upper_level.nil? ? nil : accumulated_required_point(upper_level)

    return {
      name: name,
      lower_bound: lower_bound,
      upper_bound: upper_bound,
    }
  end

  def create_initial_mission_info(user)
    mission_goals = MISSION_GOALS[user.course]
    counts = MissionService.initial_counts(mission_goals)

    return {
      'counts' => counts,
      'missions' => generate_initial_missions(user, counts),
      'lastResetAt' => requested_at.iso8601,
    }
  end

  def generate_initial_missions(user, counts)
    missions = []
    case user.experiment_mode
    when User::EXP_MODE_ALL_ENABLED, User::EXP_MODE_NO_EXAM
      missions << generate_mission(user, counts, true, MissionService::TYPE_MULTI_CORRECT, 0)
      missions << generate_mission(user, counts, true, MissionService::TYPE_MULTI_FAST_CORRECT, 0)
    when User::EXP_MODE_OLD_MISSION
      missions << generate_mission(user, counts, true, MissionService::TYPE_CORRECT, 0)
      missions << generate_mission(user, counts, true, MissionService::TYPE_FAST_CORRECT, 0)
    else
      missions << generate_mission(user, counts, true, MissionService::TYPE_ANSWER, 0)
      missions << generate_mission(user, counts, true, MissionService::TYPE_CORRECT, 0)
      missions << generate_mission(user, counts, true, MissionService::TYPE_FAST_CORRECT, 0)
      missions << generate_mission(user, counts, false, MissionService::TYPE_MEMORIZE, 0)
    end
    missions
  end

  def fill_empty_missions(user, mission_info)
    if mission_info['missions'].blank?
      mission_goals = MISSION_GOALS[user.course]
      counts = mission_info.fetch('counts') { MissionService.initial_counts(mission_goals) }
      missions = generate_initial_missions(user, counts)
      mission_info = mission_info.merge('missions' => missions)
    end
    return mission_info
  end

  def execute_periodic_process(user, mission_info)
    last_reset_at = DateTime.parse(mission_info['lastResetAt'])
    diff_hour = (requested_at.beginning_of_hour - last_reset_at.beginning_of_hour).to_i
    diff_day = (requested_at.to_date - last_reset_at.to_date).to_i

    if diff_hour > 0
      record_point(user, last_reset_at)
      last_reset_at = requested_at
    end
    if diff_day > 0
      record_mission_count(user, mission_info)
      last_reset_at = requested_at
    end

    missions = mission_info['missions']
    if diff_day > 0 || (diff_hour > 0 && user.setting['growthResetEveryHour'])
      counts = mission_info['counts']
      missions = missions.map do |m|
        m['isShort'] ? generate_mission(user, counts, true, m['type'], 0) : m
      end
    end

    return mission_info.merge('lastResetAt' => last_reset_at.iso8601, 'missions' => missions)
  end

  def record_mission_count(user, mission_info)
    past_mission_count_data = UserData
        .where(user_id: user.id, kind: 'missionCountDiff')
        .order('time DESC')
        .first
    current_mission_count = mission_info['counts']
    if past_mission_count_data.nil?
      mission_count_diff = current_mission_count
    else
      past_mission_count = past_mission_count_data.value
      mission_count_diff = current_mission_count.merge(past_mission_count) do |key, cur_val, past_val|
        cur_val - past_val
      end
    end
    UserData.create(user_id: user.id, kind: 'missionCountDiff', value: mission_count_diff, time: requested_at)
  end

  def record_point(user, last_reset_at)
    total_point = user.point
    last_data = UserData
        .where(user_id: user.id, kind: 'pointDiff')
        .order('time DESC')
        .first

    point_diff = nil
    if last_data == nil
      point_diff = { total: total_point, current: total_point }
    elsif last_data.time.beginning_of_hour < last_reset_at.beginning_of_hour
      last_point = last_data.value['total']
      point_diff = { total: total_point, current: total_point - last_point }
    end
    if point_diff
      UserData.create(user_id: user.id, kind: 'pointDiff', value: point_diff, time: last_reset_at.iso8601)
    end
  end

  def update_mission_info_values(user, mission_info, answers)
    # `show` だけでなく `create` でも時間ごとのポイントを保存するようにする
    last_reset_at = DateTime.parse(mission_info['lastResetAt'])
    if last_reset_at.beginning_of_hour < requested_at.beginning_of_hour
      record_point(user, last_reset_at)
    end

    unfinished_missions = mission_info['missions'].reject do |mission|
      finished_mission?(mission, mission_info['counts'])
    end

    counts = mission_info['counts'].dup
    mission_goals = MISSION_GOALS[user.course]
    MissionService.update_counts(counts, mission_info, mission_goals, answers)

    user_data = []
    bonus = mission_info['bonus']
    point = mission_info['point']
    unfinished_missions.each do |mission|
      next unless finished_mission?(mission, counts)

      earned = adjusted_mission_reward(mission['reward'], bonus)
      point += earned
      mission['bonus'] = bonus
      mission['earned'] = earned
      user_data << UserData.new(user_id: user.id, kind: 'mission', value: mission, time: requested_at)
    end
    UserData.import(user_data)

    return mission_info
      .merge('counts' => counts)
      .merge(point_json(user.id, point))
  end

  def update_mission_info_missions(user, mission_info)
    counts = mission_info['counts']

    next_missions = []
    missions = mission_info['missions'].each do |m|
      is_multi_mission = m['type'].in? [MissionService::TYPE_MULTI_CORRECT, MissionService::TYPE_MULTI_FAST_CORRECT]
      if finished_mission?(m, counts) || (is_multi_mission && mission_count(m, counts) == m['startValue'])
        takeover = [mission_count(m, counts) - m['goalValue'], 0].max
        next_missions << generate_mission(user, counts, m['isShort'], m['type'], takeover)
      else
        next_missions << m
      end
    end

    return mission_info
      .merge('missions' => next_missions)
      .merge(point_json(user.id, mission_info['point']))
  end

  def adjusted_mission_reward(original_reward, bonus)
    (original_reward * bonus).round
  end

  def mission_count(mission, counts)
    count_key = mission['type'].to_s + mission['threshold'].to_s
    counts[count_key]
  end

  def finished_mission?(mission, counts)
    if value = mission_count(mission, counts)
      value >= mission['goalValue']
    else
      false
    end
  end

  def calc_mission_specs(user, counts, type)
    mission_goals = MISSION_GOALS[user.course]

    case type
    when MissionService::TYPE_ANSWER
      base_count = mission_goals.answer_count
      reward = mission_goals.answer_reward
      difficulty = 1 + 0.4 * finish_today_count(user, type)
      next_count = (base_count * difficulty).round + rand(0 .. 2)
      return [next_count, next_count * reward / base_count]
    when MissionService::TYPE_CORRECT
      base_count = mission_goals.correct_count
      reward = mission_goals.correct_reward
      difficulty = 1 + 0.4 * finish_today_count(user, type)
      next_count = (base_count * difficulty).round + rand(0 .. 2)
      return [next_count, next_count * reward / base_count]
    when MissionService::TYPE_FAST_CORRECT
      base_count = mission_goals.fast_correct_count
      reward = mission_goals.fast_correct_reward
      difficulty = 1 + 0.4 * finish_today_count(user, type)
      next_count = (base_count * difficulty).round + rand(0 .. 2)
      quizzes_performance = UserData.latest_quizzes_performance(user.id)
      threshold = calc_best_threshold(user, quizzes_performance, mission_goals.answer_time_list)
      return [next_count, next_count * reward / base_count, nil, threshold]
    when MissionService::TYPE_MULTI_CORRECT
      reward = mission_goals.multi_correct_reward
      # next_count = [1 + finish_today_count(user, type), 3].min
      next_count = 2
      quizzes_performance = UserData.latest_quizzes_performance(user.id)
      quiz_count = calc_best_quiz_count(user, quizzes_performance, mission_goals.multi_correct_count)
      return [next_count, next_count * reward, quiz_count, nil]
    when MissionService::TYPE_MULTI_FAST_CORRECT
      reward = mission_goals.multi_fast_correct_reward
      # next_count = [1 + finish_today_count(user, type), 3].min
      next_count = 2
      quizzes_performance = UserData.latest_quizzes_performance(user.id)
      threshold = calc_best_threshold(user, quizzes_performance, mission_goals.answer_time_list)
      quiz_count = calc_best_quiz_count(user, quizzes_performance, mission_goals.multi_correct_count, threshold)
      return [next_count, next_count * reward, quiz_count, threshold]
    when MissionService::TYPE_MEMORIZE
      base_mission_count = mission_goals.memorized_count
      reward = mission_goals.memorized_reward
      return [base_mission_count, reward]
    end
  end

  def generate_mission(user, counts, is_short, type, takeover)
    next_count, reward, quiz_count, threshold = calc_mission_specs(user, counts, type)
    start_value = counts.fetch(type + threshold.to_s, 0) - takeover
    return {
      type: type,
      quizCount: quiz_count,
      threshold: threshold,
      startValue: start_value,
      goalValue: start_value + next_count,
      reward: reward,
      uuid: SecureRandom.uuid,
      isShort: is_short,
    }.as_json
  end

  def calc_best_threshold(user, quizzes_performance, thresholds)
    if quizzes_performance.size == 0
      return thresholds[thresholds.size / 2]
    end
    average_time = quizzes_performance.map { |q| q[:spent_time] }.sum.to_f / quizzes_performance.size

    threshold = thresholds.select { |x| x >= average_time }.min
    return threshold || thresholds.max
  end

  def calc_best_quiz_count(user, quizzes_performance, default_value, threshold = nil)
    if quizzes_performance.size == 0
      return default_value
    end
    success_count = quizzes_performance.count { |q| q[:correct] && (!threshold || q[:spent_time] <= threshold) }
    accuracy = success_count.to_f / quizzes_performance.size

    course = Course.find_by(key: user.course)
    quiz_size = course.genres[0].quiz_size
    if accuracy == 1
      return quiz_size
    end
    return (1 .. quiz_size).min_by do |x|
      (0.5 - Distribution::Binomial.cdf(x - 1, quiz_size, accuracy)).abs
    end
  end

  def finish_today_count(user, type)
    if user.setting['growthResetEveryHour']
      start = requested_at.beginning_of_hour
      range = start ... (start + 1.hour)
    else
      range = requested_at.to_date.all_day
    end
    return UserData
      .where(user_id: user.id, kind: 'mission', time: range)
      .pluck(:value)
      .count { |mission| mission['type'] == type }
  end

  def create_ranking_from_history(user, now, size)
    scope = UserData.where(user_id: user.id, kind: 'pointDiff')

    ranking = scope.to_a
      .group_by { |x| x.time.beginning_of_hour }
      .map { |date, array| { date: date, point: array.inject(0) { |sum, item| sum + item.value['current'].to_i } } }
      .find_all { |item| item[:point] > 0 }
      .sort_by { |item| -item[:point] }
      .take(size)

    prev_data = scope.order(time: :desc).first
    prev_point = prev_data.try { |x| x.value['total'] } || 0
    return {
      ranking: ranking,
      current: user.point - prev_point,
    }
  end

  def calc_rank_from_history(user_id, total_point, now)
    scope = UserData.where(user_id: user_id, kind: 'pointDiff')

    prev_data = scope.order(time: :desc).first
    prev_point = prev_data.try { |x| x.value['total'] } || 0
    current_point = total_point - prev_point

    cnt = scope.to_a
      .group_by { |x| x.time.beginning_of_hour }
      .map { |date, array| array.inject(0) { |sum, item| sum + item.value['current'].to_i } }
      .count { |point| point > current_point }
    return cnt + 1
  end
end
