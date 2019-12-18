module ScheduledJob
  module_function

  SCREEN_VIEW_CONSTRAINT = 7.seconds

  def run_everyday(now: Time.current)
    with_logging('run_everyday', now) do
      experiment_start = Calendar.experiment_start
      today = now.to_date

      run_daily_jobs(now)

      if experiment_start
        exp_week_start = Calendar.start_of_week(experiment_start)
        if (today - exp_week_start).to_i % 14 == 0
          run_once_per_2weeks_jobs(now)
        end
      end

      run_weekly_jobs(now) if Calendar.start_of_week?(today)
    end
  end

  def report_to_slack(now: Time.current, notify: true, timeframe: 1.day)
    with_logging('report_to_slack', now, notify: notify) do

      quiz_answered = UserData.quizzes.between(now.ago(timeframe), now)

      n_answered = Hash.new(0)
      n_solved = Hash.new(0)
      n_quizzes = Hash.new { |h, course| h[course] = Hash.new(0) }

      quiz_answered.each do |data|
        value = data.value
        course = value["course"]
        answers = value["answers"]
        answers.each do |ans|
          n_answered[course] += 1
          if ans["correct"]
            n_solved[course] += 1
          end
        end
        n_quizzes[course][data.user_id] += answers.length
      end

      ####################################################
      msg_to_slack_header =
        case timeframe
        when 7.day
          "```Weekly report: From #{now.ago(timeframe)} to #{now}```\n"
        when 1.day
          "```Daily report: #{now}```\n"
        else
          "```#{timeframe.to_i / 1.day.to_i}-day report: From #{now.ago(timeframe)} to #{now}```\n"
        end

      msg_to_slack_courses = ""
      User.all_courses.each do |course|
        n_signed_up = User.where("created_at > ? AND course = ?", now.ago(timeframe), course).count
        n_login = User.where("last_access > ? AND course = ?", now.ago(timeframe), course).count

        lines = []
        if n_login == 0
          lines << "%d users logged in" % n_login
        else
          lines << "%d users logged in (%d new users)" % [n_login, n_signed_up]
          lines << "%d quizzes answered (avg: %.1f, std_deviation: %.1f, correct_rate: %.1f%%)" % [
            n_answered[course],
            n_answered[course].to_f / n_login,
            n_quizzes[course].standard_deviation || 0,
            100.0 * n_solved[course] / n_answered[course],
          ]
        end

        msg_to_slack_courses << "`#{course} course` :\n"
        lines.each do |line|
          msg_to_slack_courses << '> • ' << line << "\n"
        end
      end
      msg_to_slack_courses << "\n"

      #####################################################
      # Screen views without time constraint

      screen_views = UserData.screen_views.between(now.ago(timeframe), now)
      views_per_screen = screen_views.group_by { |sv| sv.value['action'] }

      # Create for Screen View all entries
      msg_to_slack_screenview_all = "`Screen View - all` :\n"
      views_per_screen = views_per_screen.sort_by { |key, value| value.count() }.to_h

      # Go through all Screen View Events (not app events)
      views_per_screen.reverse_each do |k, v|
        next if k == 'background'
        all_visits = views_per_screen[k].count()
        unique_visits = views_per_screen[k].pluck(:user_id).uniq.count()
        msg_to_slack_screenview_all << "> • #{all_visits} times (#{unique_visits} users): #{k}\n"
      end

      ####################################################
      # Screen views time constraint
      n_screen_view_constraint = Hash.new { |h, k| h[k] = [] }
      # Constraint Screen Views
      # condition: find for every entry next user entry and check if time constraint is met
      screen_views.sort_by { |sv| sv.value['data'].to_datetime.to_i }
      user_screen_views = screen_views.group_by { |sv| sv.user_id }

      user_screen_views.each do |user_id, svs|
        (1...svs.size).each do |index|
          next if svs[index - 1].value['action'] == 'background'
          time_int_prev_sv = svs[index - 1].value['data'].to_datetime.to_i
          time_int_current_sv = svs[index].value['data'].to_datetime.to_i
          if (time_int_current_sv - time_int_prev_sv >= SCREEN_VIEW_CONSTRAINT)
            n_screen_view_constraint[svs[index - 1].value['action']] << user_id
          end
        end
      end
      # Create for Screen View Constraint entries
      msg_to_slack_screenview_constraint = "`Screen View - stayed >= #{SCREEN_VIEW_CONSTRAINT}` :\n"
      n_screen_view_constraint = n_screen_view_constraint.sort_by { |key, value| value.count() }.to_h
      n_screen_view_constraint.reverse_each do |k, v|
        all_visits = n_screen_view_constraint[k].count()
        unique_visits = n_screen_view_constraint[k].uniq.count()
        msg_to_slack_screenview_constraint << "> • #{all_visits} times (#{unique_visits} users): #{k}\n"
      end

      ##################################################
      # Return if no notification to channel

      msgs = [
        msg_to_slack_header,
        msg_to_slack_courses,
        msg_to_slack_screenview_all,
        msg_to_slack_screenview_constraint,
      ]

      return msgs.join('') unless notify

      config = YAML.load(File.read(Rails.root + 'config/slack_address.yml'))['slack']
      notifier = Slack::Notifier.new(config['uri'], channel: config['channel'])
      msgs.each do |msg|
        notifier.ping(msg)
      end
    end
  end

  def run_daily_jobs(now)
    with_logging('run_daily_jobs', now) do
      this_week = Calendar.start_of_week(now.to_date)
      BulkInserter.create_missing_study_histories([this_week])
    end
  end

  def run_weekly_jobs(now)
    with_logging('run_weekly_jobs', now) do
    end
  end

  def run_once_per_2weeks_jobs(now)
    with_logging('run_once_per_2weeks_jobs', now) do
    end
  end

  def with_logging(job_name, now, notify: true)
    puts "Start ScheduledJob.#{job_name} fired at #{now} (now: #{Time.current})" if notify
    return yield
  ensure
    puts "Finish ScheduledJob.#{job_name} fired at #{now} (now: #{Time.current})" if notify
  end
end
