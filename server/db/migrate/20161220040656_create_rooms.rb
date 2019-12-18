class CreateRooms < ActiveRecord::Migration[5.0]
  def change
    enable_extension 'uuid-ossp'

    create_table :rooms, id: :uuid do |t|
      t.boolean :active, null: false, default: false
      t.timestamps
    end

    add_column :users, :room_id, :uuid
    add_column :messages, :room_id, :uuid
  end
end
