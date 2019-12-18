# == Schema Information
#
# Table name: teachers
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  school_id  :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Teacher < ApplicationRecord
  has_many :users, dependent: :nullify

  validates_presence_of :name
end
