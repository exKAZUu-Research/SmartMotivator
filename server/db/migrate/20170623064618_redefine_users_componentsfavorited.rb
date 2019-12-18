class RedefineUsersComponentsfavorited < ActiveRecord::Migration[5.1]
  def up
    remove_column :users, :componentsfavorited
    add_column :users, :componentsfavorited, :jsonb, null: false, default: {}
  end
end
