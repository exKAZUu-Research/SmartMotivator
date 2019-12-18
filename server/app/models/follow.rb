# == Schema Information
#
# Table name: follows
#
#  id          :integer          not null, primary key
#  follower_id :uuid             not null
#  followee_id :uuid             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_follows_on_follower_id_and_followee_id  (follower_id,followee_id) UNIQUE
#

class Follow < ApplicationRecord
  validates :follower_id, :followee_id, presence: true
  belongs_to :follower, class_name: 'User'
  belongs_to :followee, class_name: 'User'
end
