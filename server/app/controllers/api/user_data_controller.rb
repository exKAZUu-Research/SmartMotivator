class API::UserDataController < API::BaseController
  def index(kind)
    # @show_json = true
    user_id = params['userId']
    ud = UserData.where(user_id: user_id, kind: kind).order(time: :desc).take(100)
    render_json ud.as_json(only: %i(value time))
  end

  def create
    data = Array.wrap(params['data'])

    UserData.transaction do
      data.each do |row|
        (user_id = row['userId'].presence) || next
        (kind = row['kind'].presence) || next
        (value = row['value'].presence) || next
        (time_msec = row['time_msec'].presence) || next
        time = msec_to_timestamp(time_msec)

        value = JSON.parse(value)
        UserData.create(user_id: user_id, kind: kind, value: value, time: time)
      end
    end
    render_json(count: data.size)
  end

  def msec_to_timestamp(value)
    Time.zone.at(Rational(value.to_i, 1000))
  end
end
