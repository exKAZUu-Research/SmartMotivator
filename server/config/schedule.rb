# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever

set :output, standard: 'log/cron_output.log', error: 'log/cron_error.log'

every 1.day do
  runner 'ScheduledJob.run_everyday'
end

every 1.day, at: '4:00 am' do
  runner 'ScheduledJob.report_to_slack(timeframe:1.day)'
end

every :sunday, at: '4:00 am' do
  runner 'ScheduledJob.report_to_slack(timeframe:7.day)'
end
