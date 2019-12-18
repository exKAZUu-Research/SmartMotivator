class ChangeColumnName < ActiveRecord::Migration[5.1]
  def change
    rename_column :users, :favoritecomponents, :componentsfavorited
  end
end
