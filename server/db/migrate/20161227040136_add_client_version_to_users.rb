class AddClientVersionToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :last_access, :datetime, null: false, default: Time.zone.at(0)
    add_column :users, :client_version, :string, null: false, default: ''
  end
end
