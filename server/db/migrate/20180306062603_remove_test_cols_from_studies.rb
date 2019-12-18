class RemoveTestColsFromStudies < ActiveRecord::Migration[5.1]
  def change
    remove_column :studies, :test_status, :integer
    remove_column :studies, :retention_interval, :integer
  end
end
