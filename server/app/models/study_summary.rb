# == Schema Information
#
# Table name: study_summaries
#
#  user_id          :uuid             primary key
#  correct_count    :integer
#  total_count      :integer
#  total_spent_time :integer
#  memorized_word   :integer
#

class StudySummary < ApplicationRecord
  self.primary_key = :user_id

  def readonly?
    true
  end
end
