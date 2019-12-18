class AddIdPassToSchool < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :login_id, :string, null: false, default: ''
    add_column :schools, :login_password, :string, null: false, default: ''
  end
end
