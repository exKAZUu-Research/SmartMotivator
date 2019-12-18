module MissionService
  TYPE_ANSWER = 'answer'
  TYPE_CORRECT = 'correct'
  TYPE_FAST_CORRECT = 'fastCorrect'
  TYPE_MULTI_CORRECT = 'multiCorrect'
  TYPE_MULTI_FAST_CORRECT = 'multiFastCorrect'
  TYPE_MEMORIZE = 'memorized'

  module_function

  def initial_counts(mission_goals)
    counts = {}
    [TYPE_ANSWER, TYPE_CORRECT, TYPE_MULTI_CORRECT, TYPE_MEMORIZE].each do |key|
      counts[key] = 0
    end
    mission_goals.answer_time_list.each do |time|
      counts["#{TYPE_FAST_CORRECT}#{time}"] = 0
      counts["#{TYPE_MULTI_FAST_CORRECT}#{time}"] = 0
    end
    return counts
  end

  def update_counts(counts, mission_info, mission_goals, quiz_answeres)
    counts.default = 0

    counts[TYPE_ANSWER] += quiz_answeres.size

    cnt = quiz_answeres.count { |a| a['correct'] }
    counts[TYPE_CORRECT] += cnt
    multi_correct_mission = mission_info['missions'].find { |m| m['type'] == TYPE_MULTI_CORRECT }
    if multi_correct_mission && cnt >= multi_correct_mission['quizCount']
      counts[TYPE_MULTI_CORRECT] += 1
    end

    multi_fast_correct_mission = mission_info['missions'].find { |m| m['type'] == TYPE_MULTI_FAST_CORRECT }
    mission_goals.answer_time_list.each do |threshold|
      cnt = quiz_answeres.count { |a| a['correct'] && a['spentTime'] <= threshold }
      counts["#{TYPE_FAST_CORRECT}#{threshold}"] += cnt
      if multi_fast_correct_mission && cnt >= multi_fast_correct_mission['quizCount']
        counts["#{TYPE_MULTI_FAST_CORRECT}#{threshold}"] += 1
      end
    end

    cnt = quiz_answeres.inject(0) { |sum, a| sum + a.fetch('memorized', 0) }
    counts[TYPE_MEMORIZE] += cnt

    return counts
  end
end
