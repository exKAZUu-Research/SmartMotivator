# == Schema Information
#
# Table name: mutes
#
#  id         :integer          not null, primary key
#  muter_id   :uuid             not null
#  mutee_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_mutes_on_muter_id_and_mutee_id  (muter_id,mutee_id) UNIQUE
#

class Mute < ApplicationRecord
  belongs_to :muter, class_name: 'User'
  belongs_to :mutee, class_name: 'User'
end
