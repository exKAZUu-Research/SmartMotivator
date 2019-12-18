class AddAutoRandomizeToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :auto_randomize, :boolean, default: false, null: false
  end
end
