class AddMissionToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :point, :integer, null: false, default: 0
    add_column :users, :mission, :jsonb, null: false, default: {}
  end
end
