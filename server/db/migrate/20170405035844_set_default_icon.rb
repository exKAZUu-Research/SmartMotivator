class SetDefaultIcon < ActiveRecord::Migration[5.0]
  def change
    execute "UPDATE users SET icon = 'user' WHERE users.icon IS NULL OR users.icon = ''"
    execute "UPDATE users SET color = 'lightblue' WHERE users.color IS NULL OR users.color = ''"

    change_column_default :users, :icon, ''
    change_column_default :users, :color, ''
    change_column :users, :icon, :string, null: false
    change_column :users, :color, :string, null: false
  end
end
