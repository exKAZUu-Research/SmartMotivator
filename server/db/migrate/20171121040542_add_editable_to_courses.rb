class AddEditableToCourses < ActiveRecord::Migration[5.1]
  def change
    add_column    :courses, :editable,     :boolean, null: false, default: false
    remove_column :courses, :public_label, :string,  null: false, default: ''
    remove_column :courses, :quiz_size,    :integer, null: false, default: 0
    add_column    :genres,  :quiz_size,    :integer, null: false, default: 0
  end
end
