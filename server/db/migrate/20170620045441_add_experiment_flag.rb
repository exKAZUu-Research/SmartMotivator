class AddExperimentFlag < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :is_experiment, :boolean, null: false, default: false
    add_column :users, :experiment_mode, :string
    remove_column :users, :experiment, :boolean, null: false, default: false
    remove_column :users, :auto_randomize, :boolean, null: false, default: false
  end
end
