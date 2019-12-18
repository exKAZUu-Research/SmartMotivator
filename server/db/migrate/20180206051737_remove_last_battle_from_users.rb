class RemoveLastBattleFromUsers < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :last_battle, :jsonb, null: true
  end
end
