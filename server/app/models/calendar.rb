module Calendar
  module_function

  def start_of_week?(date)
    date.sunday?
  end

  def start_of_week(today, offset: 0)
    (today + 1.day).monday - 1.day + offset.weeks
  end

  def experiment_start
    GlobalSetting.experiment_start_day
  end

  def experiment_end
    GlobalSetting.experiment_end_day
  end
end
