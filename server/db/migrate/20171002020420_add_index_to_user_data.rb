class AddIndexToUserData < ActiveRecord::Migration[5.1]
  def change
    add_index :user_data, [:kind, :user_id]
  end
end
