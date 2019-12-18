class DeleteRoom < ActiveRecord::Migration[5.1]
  def up
    drop_table :rooms
    drop_table :room_members
    drop_table :room_messages
  end
end
