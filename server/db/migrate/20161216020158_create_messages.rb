class CreateMessages < ActiveRecord::Migration[5.0]
  def change
    create_table :messages do |t|
      t.string :user_id, null: false
      t.text :text, null: false, default: ''
      t.timestamps
    end
  end
end
