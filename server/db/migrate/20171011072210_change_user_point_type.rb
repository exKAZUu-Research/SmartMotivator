class ChangeUserPointType < ActiveRecord::Migration[5.1]
  def change
    change_column :users, :point, :int8
  end
end
