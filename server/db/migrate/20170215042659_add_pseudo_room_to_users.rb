class AddPseudoRoomToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :teams,  :jsonb, null: false, default: []
    add_column :users, :rivals, :jsonb, null: false, default: []
  end
end
