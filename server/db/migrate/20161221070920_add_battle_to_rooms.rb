class AddBattleToRooms < ActiveRecord::Migration[5.0]
  def change
    add_column :rooms, :battle_id, :uuid
  end
end
