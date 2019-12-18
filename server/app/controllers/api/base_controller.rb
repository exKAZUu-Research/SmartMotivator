module API
  class BaseController < ActionController::API
    attr_reader :client_version, :ip_address

    before_action :set_date_offset
    before_action :run_scheduled_job if Rails.env.development?

    before_action do
      user_id = request.headers['X-USER-ID']
      @client_version = version = request.headers['X-CLIENT-VERSION']
      @ip_address = request.remote_ip

      if user_id && version && ip_address
        User.where(id: user_id).update_all(
          last_access: requested_at,
          client_version: version,
          ip_address: ip_address
        )
      end

      # TODO: 将来的にはtest環境でもチェックするようにし、テストを修正する
      if !Rails.env.test? && !VersionChecker.pass?(version)
        render status: :forbidden, json: { message: 'Client version mismatch' }
      end
    end

    def render_json(obj, camelize: true, **opts)
      json = obj.as_json
      json = camelize_key_recursive(json) if camelize
      if @show_json
        puts "=" * 20
        puts JSON.pretty_generate(json)
      end
      render json: json, **opts
    end

    def set_date_offset
      if (offset = request.headers['X-DATE-OFFSET'].presence)
        offset = offset.to_i
        if offset != 0
          time = Time.current + offset.day
          RequestStore.store[:requested_at] = time
        end
      end
    end

    def requested_at
      RequestStore.store[:requested_at] ||= Time.current
    end

    def camelize_key_recursive(obj, key_map = Hash.new { |h, k| h[-k] = k.include?('_') ? -k.camelize(:lower) : -k })
      case obj
      when Hash
        obj.each_with_object({}) do |(k, v), hash|
          hash[key_map[k]] = camelize_key_recursive(v, key_map)
        end
      when Array
        obj.map { |v| camelize_key_recursive(v, key_map) }
      when ActiveSupport::TimeWithZone
        obj.iso8601
      else
        obj
      end
    end

    def run_scheduled_job
      now = requested_at

      today = now.to_date
      daily_job_executed_at = GlobalSetting.daily_job_executed_at
      if today != daily_job_executed_at
        ScheduledJob.run_daily_jobs(now)
        GlobalSetting.daily_job_executed_at = today
      end

      this_week = Calendar.start_of_week(today)
      weekly_job_executed_at = GlobalSetting.weekly_job_executed_at
      if this_week != weekly_job_executed_at
        ScheduledJob.run_weekly_jobs(now)
        GlobalSetting.weekly_job_executed_at = this_week
      end
    end

    rescue_from ActiveRecord::RecordNotFound do |ex|
      render status: :not_found, json: { message: ex.message }
    end
    rescue_from ActiveRecord::RecordInvalid do |ex|
      Rails.logger.error ex
      render status: 422, json: { message: ex.message }
    end
  end
end
