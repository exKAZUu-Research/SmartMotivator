class CreateGlobalSettings < ActiveRecord::Migration[5.0]
  def change
    create_table :global_settings, id: false do |t|
      t.string :key, null: false
      t.string :value, null: false
    end
    add_index :global_settings, :key, unique: true
  end
end
