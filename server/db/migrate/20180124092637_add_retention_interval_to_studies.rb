class AddRetentionIntervalToStudies < ActiveRecord::Migration[5.1]
  def change
    add_column :studies, :retention_interval, :integer, null: true;
  end
end
