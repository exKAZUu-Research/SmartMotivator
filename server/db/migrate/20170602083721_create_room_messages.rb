class CreateRoomMessages < ActiveRecord::Migration[5.0]
  def change
    drop_table :rooms, if_exists: true
    drop_table :messages, if_exists: true
    drop_table :likes, if_exists: true

    remove_column :users, :room_id, :uuid

    create_table :rooms, id: :uuid do |t|
      t.string :name, null: false, default: ''
      t.uuid :owner_id, null: false

      t.string :course, null: false
      t.integer :goal_correct_count, null: false
      t.integer :correct_count, null: false, default: 0
      t.float :score, null: true

      t.datetime :started_at, null: false
      t.datetime :ended_at, null: false

      t.timestamps
    end

    create_table :room_members do |t|
      t.uuid :user_id, null: false
      t.uuid :room_id, null: false
      t.integer :correct_count, null: false, default: 0

      t.timestamps
    end
    add_index :room_members, [:user_id, :room_id], unique: true

    create_table :room_messages, id: :uuid do |t|
      t.uuid :room_id, null: false
      t.uuid :user_id, null: false
      t.text :text, null: false, default: ''
      t.timestamps
    end
  end
end
