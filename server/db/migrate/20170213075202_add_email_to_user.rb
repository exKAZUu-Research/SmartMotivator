class AddEmailToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :email, :string
    add_column :users, :passcode, :string
    add_column :users, :passcode_expire, :datetime
  end
end
