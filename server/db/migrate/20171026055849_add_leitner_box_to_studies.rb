class AddLeitnerBoxToStudies < ActiveRecord::Migration[5.1]
  def change
    add_column :studies, :leitner_box, :integer, null: false, default: 0
  end
end
