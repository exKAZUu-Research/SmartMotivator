class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users, id: :string do |t|
      t.integer :point, null: false, default: 0
      t.string :setting, null: false, default: '{}'
      t.datetime :last_launched_at, null: false
      t.timestamps
    end
    execute <<-SQL.gsub(/\s+/, ' ').strip
      INSERT INTO users (id, setting, last_launched_at, created_at, updated_at)
      SELECT user_id, setting_hash, '1970-01-01 00:00:00', created_at, updated_at
      FROM user_settings
    SQL
    drop_table :user_settings
  end
end
