# == Schema Information
#
# Table name: users
#
#  id                 :uuid             not null, primary key
#  setting            :jsonb            not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  name               :string           default(""), not null
#  last_access        :datetime
#  client_version     :string           default(""), not null
#  survey_started_at  :datetime
#  survey_resumed_at  :datetime
#  survey_finished_at :datetime
#  ready              :boolean          default(FALSE), not null
#  course             :string           default(""), not null
#  email              :string
#  passcode           :string
#  passcode_expire    :datetime
#  pseudo_room        :jsonb            not null
#  school_id          :uuid
#  teacher_id         :uuid
#  login_id           :string
#  password           :string
#  role               :string           default(""), not null
#  icon               :string           default(""), not null
#  color              :string           default(""), not null
#  ip_address         :string           default(""), not null
#  introduction       :string           default(""), not null
#  experiment_mode    :string
#  point              :integer          default(0), not null
#  mission            :jsonb            not null
#
# Indexes
#
#  index_users_on_login_id  (login_id) UNIQUE
#

require 'open3'

class User < ApplicationRecord
  include SuperQuery
  include Student

  COMP_MODE_SERIOUS = 'serious'
  COMP_MODE_CASUAL = 'casual'
  COMP_MODE_NONE = 'none'
  ALL_COMP_MODES = [COMP_MODE_SERIOUS, COMP_MODE_CASUAL, COMP_MODE_NONE]

  BATTLE_TYPE_INDIVIDUAL = 'individual'
  BATTLE_TYPE_TEAM = 'team'
  BATTLE_TYPE_BOTH = 'both'
  ALL_BATTLE_TYPES = [BATTLE_TYPE_INDIVIDUAL, BATTLE_TYPE_TEAM, BATTLE_TYPE_BOTH]

  BATTLE_DIFFICULTY_HARD = 'hard'
  BATTLE_DIFFICULTY_NORMAL = 'normal'
  BATTLE_DIFFICULTY_EASY = 'easy'
  ALL_BATTLE_DIFFICULTIES = [BATTLE_DIFFICULTY_HARD, BATTLE_DIFFICULTY_NORMAL, BATTLE_DIFFICULTY_EASY]

  COURSE_ENGLISH = 'english'
  COURSE_IT = 'informatics'
  COURSE_ITPASS = 'itpassport'

  ROLE_NONE = ''
  ROLE_DEVELOPER = 'developer'

  DEFAULT_SETTING = {
    pointType: 'absolute',
    positiveFraming: true,
    praiseEffort: false,
    growthResetEveryHour: false,
  }

  SETTING_TO_VALUES = {
    pointType: %w(absolute self other),
    positiveFraming: [false, true],
    praiseEffort: [false, true],
    growthResetEveryHour: [false, true],
  }.as_json.freeze

  DEFAULT_ICON_NAME = 'user'

  ICON_COLORS = [
    'crimson',
    'orangered',
    'salmon',
    'mediumvioletred',
    'hotpink',
    'orchid',
    'plum',
    'goldenrod',
    'orange',
    'gold',
    'lightblue',
    'slategrey',
    'green',
    'mediumseagreen',
    'limegreen',
    'darkturquoise',
    'dodgerblue',
    'navy',
  ]

  # EXP_MODE_DEFAULT = 'default'
  EXP_MODE_MINIMAL = 'minimal'
  # EXP_MODE_MANUAL = 'manual'
  # EXP_MODE_RANDOM = 'random'
  # EXP_MODE_FIXED = 'fixed'

  # EXP_MODE_LEITNER_QUEUE = 'leitnerqueue'
  # EXP_MODE_OLD_DEFAULT = 'oldDefault'
  # EXP_MODE_OLD_SELF = 'oldSelf'
  # EXP_MODE_NEW_DEFAULT = 'newDefault'
  # EXP_MODE_NEW_SELF = 'newSelf'

  EXP_MODE_ALL_ENABLED = 'allEnabled'
  EXP_MODE_NO_EXAM = 'noExam'
  EXP_MODE_OLD_MISSION = 'oldMission'

  EXP_MODE_CURRENT = 'current'
  EXP_MODE_DESIGN = 'design'

  PASSCODE_EXPIRE = 1.hours

  scope :visible, -> { where(ready: true) }
  scope :search_by_name, ->(name) { where("lower(name) LIKE ?", "%#{name.downcase}%") }

  has_many :study_histories, dependent: :delete_all
  has_many :user_data, class_name: "UserData", dependent: :delete_all
  has_many :studies, dependent: :delete_all
  has_one :study_summary

  before_create :before_create_callback
  before_save :before_save_callback
  after_save :after_save_callback

  # SETTING_KEYS.each do |key|
  #   define_method(key.underscore.to_sym) { setting[key] }
  # end

  def developer?
    self.role == ROLE_DEVELOPER
  end

  def send_passcode(now)
    self.passcode = '%06d' % rand(1_000_000)
    self.passcode_expire = now + PASSCODE_EXPIRE
    self.save
    UserMailer.passcode(self).deliver_now
  end

  def confirm_passcode(passcode, now)
    if self.passcode == passcode && self.passcode_expire && now < self.passcode_expire
      self.passcode = nil
      self.passcode_expire = nil
      true
    else
      false
    end
  end

  def before_create_callback
    self.icon = DEFAULT_ICON_NAME
    self.color = ICON_COLORS.sample
  end

  def before_save_callback
    if school_id.present? && (!persisted? || school_id_changed?) && school.course.present?
      self.course = school.course
    end
    if course.present? && course_changed?
      self.mission = {}
    end

    if ready && !ready_was
      set_ready
    end
  end

  def after_save_callback
    today = current_time.to_date
    if ready && (saved_change_to_attribute?(:ready) || saved_change_to_attribute?(:course))
      dates = [-1, 0].map { |offset| Calendar.start_of_week(today, offset: offset) }
      BulkInserter.create_missing_study_histories(dates, self)
    end
  end

  def set_ready
    if (s = self.school)
      ready_user_count = s.users.where(ready: true).where.not(id: self.id).count
      if s.is_experiment
        mode_list = EXP_MODE_CURRENT, EXP_MODE_DESIGN, EXP_MODE_NO_EXAM, EXP_MODE_MINIMAL
        self.experiment_mode = mode_list[ready_user_count % mode_list.size]
      end
    end
    initialize_setting(false)
  end

  def initialize_setting(randomize = true)
    if survey_finished_at.nil?
      self.setting = DEFAULT_SETTING
    else
      recommendation = recommended_setting
      if recommendation.empty?
        randomize_setting(nil)
      elsif randomize
        confidence_threshold = 0.12
        recommendation.each do |setting_key, setting|
          random_setting_probability =
              [(confidence_threshold - setting['confidence']) / confidence_threshold * 0.9, 0].max + 0.1
          self.setting[setting_key] =
              rand < random_setting_probability ? SETTING_TO_VALUES[setting_key].sample : setting['value']
        end
      else
        self.setting = recommendation.map { |setting_key, setting|
          { setting_key => setting['value'] }
        }.reduce(:merge)
      end
    end
    log_setting(UserData::DUMP_EVENT_CREATE) if self.setting_changed?
  end

  def update_setting_by_user(params)
    return unless params
    self.setting = params.permit(DEFAULT_SETTING.keys).normalize_values.to_h
    log_setting(UserData::DUMP_EVENT_BY_USER) if self.setting_changed?
  end

  def randomize_setting(event_name)
    self.setting = SETTING_TO_VALUES.transform_values { |v| v.sample }
    log_setting(event_name) if event_name
  end

  def log_setting(event_name)
    now = current_time
    value = {
      event: event_name,
      setting: setting,
    }
    UserData.create!(
      user_id: id,
      kind: UserData::KIND_LOG_SETTING,
      value: value,
      time: now)
  end

  def log_components_favorited(event_name)
    now = current_time
    value = {
      event: event_name,
      components_favorited: componentsfavorited,
    }
    UserData.create!(
      user_id: id,
      kind: UserData::KIND_LOG_COMPONENTS_FAVORITED,
      value: value,
      time: now)
  end

  def current_time
    RequestStore.store[:requested_at] || Time.current
  end

  def recommended_setting
    PredictionModel.first_or_default.recommended_setting(survey_values)
  end

  def toggle_developer_role
    self.role = (role == ROLE_DEVELOPER) ? ROLE_NONE : ROLE_DEVELOPER
  end

  def self.create_dummy_highscore
    user = User.where.not(last_access: nil).order(:last_access).last
    UserData.where(user_id: user.id, kind: 'pointDiff').delete_all
    bonus = user.mission['bonus'].to_f
    total_point = user.point

    5.times do |i|
      current_point = (bonus * 20 * (5 - i)).to_i
      point_diff = { total: total_point, current: current_point }
      total_point -= current_point
      UserData.create(user_id: user.id, kind: 'pointDiff', value: point_diff, time: Time.current - (i + 1).day)
    end
    return bonus
  end

  def self.all_courses
    User.all.uniq.pluck(:course)
  end

  class << self
    def last
      where.not(last_access: nil).order(last_access: :desc).take
    end

    #
    # current_course が設定されたデータを request_course を送信してきたクライアントから利用できるかどうか
    #
    def valid_course?(current_course, request_course)
      true
    end

    #
    # 指定のメールアドレスを持つユーザを返す。なければ作成して返す。
    # メールアドレスが利用できない場合は :email を、
    # コースが利用できない場合は :course を返します。
    #
    def find_or_create_with_email(email, course, option = {})
      course = course.presence

      user = User.where(email: email).take
      if user
        if valid_course?(user.course, course)
          return user
        else
          return :course
        end
      end

      school = School.find_by_email(email)
      return :email unless school
      if valid_course?(school.course, course)
        create!(option) do |u|
          u.email = email
          u.course = course if course
          u.school_id = school.id
        end
      else
        return :course
      end
    end

    def randomize_setting
      User.where(experiment_mode: EXP_MODE_RANDOM).find_each do |u|
        u.randomize_setting(UserData::DUMP_EVENT_BY_BATCH)
        u.save
      end
    end

    def create_dummies(size, now, course:)
      icons = %w(user eyedropper bell shield yen
        bug glass music heart star camera umbrella
        fighter-jet space-shuttle paper-plane leaf globe
        briefcase truck cab bicycle motorcycle train ship).shuffle
      colors = ICON_COLORS.shuffle

      today = now.to_date
      users = []
      size.times do |n|
        user = User.new(
          id: SecureRandom.uuid,
          name: "User #{n}",
          ready: true,
          course: course,
          icon: icons[n % icons.size],
          color: colors[n % colors.size],
          last_access: now,
          point: n * 10 + rand(10),
          mission: {}
        )
        user.initialize_setting
        users << user
      end
      dates = [-1, 0].map { |offset| Calendar.start_of_week(today, offset: offset) }
      transaction do
        User.import users
        BulkInserter.create_missing_study_histories(dates)
        return size
      end
    end
  end

  private

  def survey_values
    survey_data = user_data.surveys.first
    if survey_data.nil?
      JSON.generate([1] * 99)
    else
      survey_data.value
    end
  end
end
