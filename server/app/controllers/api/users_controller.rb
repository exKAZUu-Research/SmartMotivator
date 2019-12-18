class API::UsersController < API::BaseController
  FIELDS = %w(name course ready icon color introduction experimentMode)

  def create
    user = params[:user]
    # @show_json = true
    now = requested_at
    access_info = {
      last_access: now,
      client_version: client_version,
      ip_address: ip_address,
    }.compact

    user_hash = user.permit(:id, :email, :passcode, :loginId, :password, *FIELDS)
    if (email = user_hash['email'])
      if (passcode = user_hash['passcode'])
        return confirm_passcode(user_hash, email, passcode, now)
      end
      return send_passcode(email, user_hash['course'], now, access_info)
    end
    if (login_id = user_hash['loginId'])
      return create_with_login_id_and_password(user_hash, login_id, now, access_info)
    end

    field_for_create = user_hash.slice('id', *FIELDS).merge(access_info)
    u = User.create(field_for_create)
    render_json user_json(u, now)
  end

private

  def send_passcode(email, course, now, access_info)
    email.strip!

    result = User.find_or_create_with_email(email, course, access_info)
    case result
    when User
      result.send_passcode(now)
      render_json({}) # return empty json
    when :course
      render_json({ message: 'wrong course', field: 'course' }, status: 400)
    else
      render_json({ message: 'wrong email', field: 'email' }, status: 400)
    end
  end

  def confirm_passcode(user_hash, email, passcode, now)
    email.strip!
    passcode.strip!
    if u = User.where(email: email).take
      if u.confirm_passcode(passcode, now)
        render_json user_json(u, now)
      else
        render_json({ message: 'wrong passcode', field: 'passcode' }, status: 400)
      end
    else
      render_json({ message: 'wrong email', field: 'email' }, status: 400)
    end
  end

  def create_with_login_id_and_password(user_hash, login_id, now, access_info)
    inputted_password = user_hash['password']
    course = user_hash['course'].presence

    is_id_match = false
    data_found = false
    User.where(login_id: login_id).find_each do |u|
      data_found = true
      next unless User.valid_course?(u.course, course)
      is_id_match = true
      if u.password == inputted_password
        return render_json user_json(u, now)
      end
    end
    School.where(login_id: login_id).find_each do |school|
      data_found = true
      next unless User.valid_course?(school.course, course)
      is_id_match = true
      if school.login_password == inputted_password
        field_for_create = user_hash.slice('id', *FIELDS)
          .merge(access_info)
          .merge(school_id: school.id)
        u = User.create!(field_for_create)
        return render_json user_json(u, now)
      end
    end

    case
    when is_id_match
      render_json({ message: 'wrong password', field: 'password' }, status: 400)
    when data_found
      render_json({ message: 'wrong course', field: 'course' }, status: 400)
    else
      render_json({ message: 'wrong login id', field: 'loginId' }, status: 400)
    end
  end

public

  def show(id)
    # @show_json = true
    u = User.find(id)
    render_json user_json(u, requested_at)
  end

  def search_user(id)
    u = User.find_by(id: id)
    searched_users = User
      .eager_load(:study_summary)
      .where.not(id: u.id)
      .visible
      .search_by_name(params['query'])
      .order(last_access: :desc)
    mute_by_u = Mute.where(muter_id: u.id).pluck(:mutee_id).to_set
    render_json searched_users.map { |su| user_follow_json(su).merge(muted: (mute_by_u.member? su.id)) }
  end

  def show_following(id)
    u = User.find_by(id: id)

    followee_ids = Follow.select(:followee_id).where(follower_id: id)
    followed_users = User.eager_load(:study_summary).where(id: followee_ids).to_a
    followed_users << u
    mute_by_u = Mute.where(muter_id: u.id).pluck(:mutee_id).to_set
    render_json followed_users.map { |su| user_follow_json(su).merge(muted: (mute_by_u.member? su.id)) }
  end

  def toggle_follow(id, follow_id)
    relation = Follow.where(follower_id: id, followee_id: follow_id)

    if relation.empty?
      relation.create
      is_followed = true
    else
      relation.destroy_all
      is_followed = false
    end

    followed_user = User.find(follow_id)
    render_json user_follow_json(followed_user).merge(followed: is_followed)
  end

  def show_user_details(id, selected_user_id)
    followed_user = User.find(selected_user_id)
    is_followed = Follow.where(follower_id: id, followee_id: selected_user_id).present?
    is_muted = Mute.where(muter_id: id, mutee_id: selected_user_id).present?

    n_answer = followed_user.study_summary.total_count
    n_correct = followed_user.study_summary.correct_count
    correct_rate = 0
    avg_speed = 0
    if n_answer > 0
      correct_rate = 1.0 * followed_user.study_summary.correct_count / n_answer
      avg_speed = 1.0 * followed_user.study_summary.total_spent_time / n_answer
    end

    json = user_follow_json(followed_user)
    json.merge!(
      followed: is_followed,
      muted: is_muted,
      correctAns: n_correct,
      percentCorrectAns: correct_rate,
      avgSpeed: avg_speed)
    render_json json
  end

  def toggle_mute(id, mutee_id)
    relation = Mute.where(muter_id: id, mutee_id: mutee_id)

    if relation.empty?
      relation.create!
      is_muted = true
    else
      relation.destroy_all
      is_muted = false
    end

    user = User.find(mutee_id)
    render_json user_follow_json(user).merge(muted: is_muted)
  end

  def update(id, user: nil, survey: nil)
    # @show_json = true
    u = User.find(id)
    if user
      hash = user.permit(*FIELDS)
      if (exp_mode = hash.delete('experimentMode'))
        hash['experiment_mode'] = exp_mode
      end
      u.assign_attributes(hash)
      u.update_setting_by_user(user['setting'])
    end

    if survey
      survey['startedAt'].try { |x| u.survey_started_at = msec_to_timestamp(x) }
      survey['resumedAt'].try { |x| u.survey_resumed_at = msec_to_timestamp(x) }
      survey['finishedAt'].try { |x| u.survey_finished_at = msec_to_timestamp(x) }
    end
    u.save!

    render_json user_json(u, requested_at)
  end

  def show_recommended_setting(id)
    u = User.find(id)
    setting = u.recommended_setting
    setting.each { |k, v| setting[k] = v['value'] }
    render_json setting
  end

  private

  def user_json(user, now)
    user_hash = {
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      course_name: Course.find_by_key(user.course).try(:label),
      role: user.role,
      point: user.point,
      ready: user.ready,
      setting: user.setting,
      icon: user.icon,
      color: user.color,
      introduction: user.introduction,
    }.merge(school_custom_json_field(user, now))

    if user.experiment_mode.present?
      user_hash.merge!(
        experiment_mode: user.experiment_mode,
        experiment_end_day: GlobalSetting.experiment_end_day,
      )
    end
    user_hash
  end

  def user_follow_json(user)
    {
      id: user.id,
      name: user.name,
      point: user.point,
      correct_ans: user.study_summary.correct_count,
      last_access: user.last_access,
      icon: user.icon,
      color: user.color,
      introduction: user.introduction,
      course: user.course
    }
  end

  def school_custom_json_field(user, now)
    if school = user.school
      return {
        school_id: user.school_id,
        beacon: school.try(:use_beacon) || false,
        school: {
          id: school.id,
          name: school.any_name,
        }
      }
    else
      return {
        school_id: nil,
        beacon: false,
        school: nil,
      }
    end
  end
  def msec_to_timestamp(value)
    value = value.to_f
    Time.zone.at((value / 1000).round) if value > 0
  end
end
