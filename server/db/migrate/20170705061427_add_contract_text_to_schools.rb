class AddContractTextToSchools < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :contact_text, :text, null: false, default: ''
  end
end
