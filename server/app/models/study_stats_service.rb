module StudyStatsService
  YMD = '%Y-%m-%d'.freeze

  Record = Struct.new(:goal, :value, :rank)

  Tuple = Struct.new(:rate, :count, :spent_time, :memorized_word) do
    def map
      Tuple.new(
        yield(rate),
        yield(count),
        yield(spent_time),
        yield(memorized_word),
      )
    end
  end

  module_function

  def call(user_id, course, this_week)
    ActiveRecord::Base.transaction do
      records = StudyHistory.where(user_id: user_id, course: course).to_a
      stats = records.each_with_object({}) do |r, obj|
        obj[r.week_start.strftime(YMD)] = calc_stats_one(r, this_week)
      end
      tuple, len = calc_stats_all_term(user_id, course)
      stats['all'] = tuple
      stats['num_of_users'] = len
      stats
    end
  end

  def calc_stats_one(record, this_week)
    if record.week_start > this_week
      # 未来なので、統計計算は行わない
      tuple = Tuple.new(
        record.rate_goal,
        record.count_goal,
        record.spent_time_goal,
        record.memorized_word_goal,
      )
      return tuple.map { |x| Record.new(x, 0, nil) }
    end

    use_cache = record.week_start < this_week
    if !use_cache || !record.cached
      info_list = StudyHistory
        .where('total_count > 0')
        .where(week_start: record.week_start, course: record.course)
        .select(:correct_count, :total_count, :total_spent_time, :memorized_word)
        .to_a
      fill_statistics(record, info_list)
      if use_cache
        record.cached = true
        record.save
      end
    end
    make_tuple(record)
  end

  def calc_stats_all_term(user_id, course)
    columns = %i(correct_count total_count total_spent_time memorized_word)
    my_total = StudyHistory
               .where(user_id: user_id, course: course)
               .x_select(sum: columns)
               .take
    info_list = StudyHistory
                .where('total_count > 0')
                .where(course: course)
                .x_select(
                  group: :user_id,
                  sum: columns
                )
                .to_a
    my_total.assign_attributes(
      rate_goal: nil,
      count_goal: nil,
      spent_time_goal: nil,
      memorized_word_goal: nil,
    )
    fill_statistics(my_total, info_list)
    tuple = make_tuple(my_total)
    len = info_list.size + (my_total.total_count > 0 ? 0 : 1)
    return [tuple, len]
  end

  def fill_statistics(record, list)
    if record.total_count > 0
      rate_rank = calc_rank(record, list, &:correct_rate)
      count_rank = calc_rank(record, list, &:correct_count)
      time_rank = calc_rank(record, list, &:spent_time_for_calc)
      word_rank = calc_rank(record, list, &:memorized_word)
    else
      rank = list.size + 1
      rate_rank = rank
      count_rank = rank
      time_rank = rank
      word_rank = rank
    end

    record.assign_attributes(
      cache_rate_rank: rate_rank,
      cache_count_rank: count_rank,
      cahce_spent_time_rank: time_rank,
      cache_memorized_word_rank: word_rank,
    )
  end

  def make_tuple(record)
    rate = Record.new(
      record.rate_goal,
      record.correct_rate,
      record.cache_rate_rank
    )
    count = Record.new(
      record.count_goal,
      record.correct_count,
      record.cache_count_rank
    )
    time = Record.new(
      record.spent_time_goal,
      record.spent_time,
      record.cahce_spent_time_rank
    )
    word = Record.new(
      record.memorized_word_goal,
      record.memorized_word,
      record.cache_memorized_word_rank
    )
    Tuple.new(rate, count, time, word)
  end

  def calc_rank(my_record, all_record, &block)
    my_value = yield(my_record)
    value_list = all_record.map(&block)
    value_list.count { |v| v > my_value } + 1
  end
end
