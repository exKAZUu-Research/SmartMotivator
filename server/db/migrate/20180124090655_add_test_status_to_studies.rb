class AddTestStatusToStudies < ActiveRecord::Migration[5.1]
  def change
    add_column :studies, :test_status, :integer, null: false, default: 0
  end
end
