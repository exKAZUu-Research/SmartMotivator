class AddReadyToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :survey_started_at, :datetime, null: true
    add_column :users, :survey_resumed_at, :datetime, null: true
    add_column :users, :survey_finished_at, :datetime, null: true
    add_column :users, :ready, :boolean, null: false, default: false
    reversible do |dir|
      dir.up do
        execute "UPDATE users SET ready = 't'"
      end
    end
  end
end
