class AddStudyAgainSentAtToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :study_again_send_at, :datetime
  end
end
