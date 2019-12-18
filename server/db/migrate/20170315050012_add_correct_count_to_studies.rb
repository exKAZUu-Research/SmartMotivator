class AddCorrectCountToStudies < ActiveRecord::Migration[5.0]
  def change
    rename_column :studies, :answer_count, :total_count
    add_column :studies, :correct_count, :integer, null: false, default: 0
  end
end
