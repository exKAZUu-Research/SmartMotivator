class RemoveOldPointFromUsers < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :effort_point, :integer, null: false, default: 0
    remove_column :users, :performance_point, :integer, null: false, default: 0
  end
end
