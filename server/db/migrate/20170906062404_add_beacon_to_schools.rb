class AddBeaconToSchools < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :use_beacon, :boolean, null: false, default: false
  end
end
