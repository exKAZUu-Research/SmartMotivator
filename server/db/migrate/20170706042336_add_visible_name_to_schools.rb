class AddVisibleNameToSchools < ActiveRecord::Migration[5.1]
  def change
    rename_column :schools, :name, :internal_name
    add_column :schools, :display_name, :string, null: false, default: ''
  end
end
