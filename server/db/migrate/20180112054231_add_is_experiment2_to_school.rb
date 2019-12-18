class AddIsExperiment2ToSchool < ActiveRecord::Migration[5.1]
  def change
    add_column :schools, :is_experiment2, :boolean, null: false, default: false
  end
end
