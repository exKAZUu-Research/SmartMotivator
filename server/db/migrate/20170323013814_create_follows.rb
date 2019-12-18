class CreateFollows < ActiveRecord::Migration[5.0]
  def change
    create_table :follows do |t|
      t.uuid :follower_id, null: false
      t.uuid :followee_id, null: false
      t.timestamps
    end
    add_index :follows, %i(follower_id followee_id), unique: true
  end
end
