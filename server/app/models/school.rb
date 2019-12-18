# == Schema Information
#
# Table name: schools
#
#  id             :uuid             not null, primary key
#  internal_name  :string           not null
#  prefix         :string           not null
#  course         :string           default(""), not null
#  read_password  :string           default(""), not null
#  write_password :string           default(""), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  login_id       :string           default(""), not null
#  login_password :string           default(""), not null
#  email_domain   :string
#  is_experiment  :boolean          default(FALSE), not null
#  contact_text   :text             default(""), not null
#  display_name   :string           default(""), not null
#  use_beacon     :boolean          default(FALSE), not null
#  is_experiment2 :boolean          default(FALSE), not null
#  quiz_editable  :boolean          default(FALSE), not null
#

class School < ApplicationRecord
  PERMISSION_READ = 'read'
  PERMISSION_WRITE = 'write'

  has_many :users do
    def with_course
      if (course = proxy_association.owner.course.presence)
        where(course: course)
      else
        all
      end
    end
  end
  has_many :teachers

  validates_presence_of :internal_name

  before_destroy :cleanup_users

  def cleanup_users
    # 触ってないユーザを削除
    self.users.where(last_access: nil).delete_all
    # 触ったユーザを School の外に追い出す
    self.users.update_all(school_id: nil, teacher_id: nil, login_id: nil, password: nil)
  end

  def can_destroy?(user)
    user.last_access.nil?
  end

  def login_id_of(student_id)
    prefix.presence.try { |x| x + student_id }
  end

  def any_name
    display_name.presence || internal_name
  end

  def has_page?
    read_password.present? || write_password.present?
  end

  def self.find_by_email(email)
    School
      .where.not(email_domain: nil)
      .where.not(email_domain: '')
      .where("? LIKE '%' || email_domain", email)
      .take
  end
end
