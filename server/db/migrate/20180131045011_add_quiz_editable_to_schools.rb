class AddQuizEditableToSchools < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :quiz_editable, :boolean, null: false, default: false
  end
end
