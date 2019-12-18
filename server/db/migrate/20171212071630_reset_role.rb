class ResetRole < ActiveRecord::Migration[5.1]
  def change
    execute "UPDATE users SET role = '' WHERE role <> ''"
  end
end
