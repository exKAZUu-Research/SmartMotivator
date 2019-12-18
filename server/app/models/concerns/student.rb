module Student
  extend ActiveSupport::Concern

  included do
    belongs_to :teacher, optional: true
    belongs_to :school, optional: true

    validate :unique_student_id, if: :student?

    attr_accessor :student_id
    before_validation :set_login_id
  end

  def student?
    self.school_id != nil
  end

  def set_login_id
    if self.student_id.present?
      self.login_id = self.school.login_id_of(self.student_id)
    end
  end

  def unique_student_id
    if login_id.present? && login_id_changed?
      if school.users.where(login_id: login_id).exists?
        errors.add(:student_id, "がすでに登録済みです")
      end
    end
  end
end
