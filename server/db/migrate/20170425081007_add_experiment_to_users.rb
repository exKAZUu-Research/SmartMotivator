class AddExperimentToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :experiment, :boolean, null: false, default: false
  end
end
