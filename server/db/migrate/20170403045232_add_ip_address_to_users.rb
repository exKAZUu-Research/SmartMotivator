class AddIpAddressToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :ip_address, :string, null: false, default: ''
  end
end
