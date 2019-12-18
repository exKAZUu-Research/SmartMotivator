class CreateUserSettings < ActiveRecord::Migration[5.0]
  def change
    create_table :user_settings do |t|
      t.string :user_id,      null: false
      t.string :setting_hash, null: false

      t.timestamps
    end

    add_index :user_settings, :user_id, unique: true
  end
end
