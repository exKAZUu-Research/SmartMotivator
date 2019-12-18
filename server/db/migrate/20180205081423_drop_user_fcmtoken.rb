class DropUserFcmtoken < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :fcmtoken, :string, null: true
    remove_column :users, :study_again_send_at, :datetime, null: true
  end
end
