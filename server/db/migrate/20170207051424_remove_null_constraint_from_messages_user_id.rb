class RemoveNullConstraintFromMessagesUserId < ActiveRecord::Migration[5.0]
  def change
    change_column :messages, :user_id, :uuid, null: true
  end
end
