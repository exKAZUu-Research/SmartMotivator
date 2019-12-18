class ChangePseudoTeam < ActiveRecord::Migration[5.0]
  def change
    remove_column :users, :teams,  :jsonb, null: false, default: []
    remove_column :users, :rivals, :jsonb, null: false, default: []

    add_column :users, :pseudo_room, :jsonb, null: false, default: {}
  end
end
