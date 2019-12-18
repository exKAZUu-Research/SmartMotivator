class DropWeeklyPoints < ActiveRecord::Migration[5.1]
  def up
    drop_table :weekly_points
  end
end
