class AddMemorizedToStudies < ActiveRecord::Migration[5.1]
  def change
    add_column :studies, :memorized, :boolean, null: false, default: false
  end
end
