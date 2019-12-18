class AddLastBattleToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :last_battle, :jsonb
  end
end
