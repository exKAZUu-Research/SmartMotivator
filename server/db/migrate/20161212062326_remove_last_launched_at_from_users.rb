class RemoveLastLaunchedAtFromUsers < ActiveRecord::Migration[5.0]
  def change
    remove_column :users, :last_launched_at, :string
  end
end
