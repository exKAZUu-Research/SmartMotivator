require 'test_helper'
require 'stringio'

class ScheduledJobTest < ActiveSupport::TestCase
  def test_run
    # mock
    now = Time.current
    today = now.to_date
    now -= (today - Calendar.start_of_week(today)).to_i.day
    assert Calendar.start_of_week?(now.to_date)
    yesterday = now.to_date - 1.day
    GlobalSetting.update_key_value(
      GlobalSetting::EXPERIMENT_START_DAY,
      yesterday.iso8601)

    silent { ScheduledJob.run_everyday(now: now) }
    assert true # no exception
  end

  def silent
    stdout = $stdout
    $stdout = StringIO.new("w")
    yield
  ensure
    $stdout = stdout
  end
end
