class AddFavoritecomponentsToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :favoritecomponents, :jsonb
  end
end
