class AddFcmtokenToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :fcmtoken, :string
  end
end
