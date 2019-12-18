class RemoveComponentsfavoritedFromUsers < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :componentsfavorited, :jsonb, default: {}, null: false
  end
end
