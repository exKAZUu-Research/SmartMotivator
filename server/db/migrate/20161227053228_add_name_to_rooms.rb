class AddNameToRooms < ActiveRecord::Migration[5.0]
  def change
    add_column :rooms, :name, :string, null: false, default: ''
  end
end
