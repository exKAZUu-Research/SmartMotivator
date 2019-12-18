class RenameStudyPoint < ActiveRecord::Migration[5.0]
  def change
    rename_column :users, :study_point, :performance_point
    rename_column :weekly_points, :study_point, :performance_point
  end
end
