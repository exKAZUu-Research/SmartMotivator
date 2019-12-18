class CreateUserData < ActiveRecord::Migration[5.0]
  def change
    create_table :user_data do |t|
      t.string :user_id, null: false
      t.string :kind, null: false
      t.string :value, null: false

      t.timestamps null: false
    end
  end
end
