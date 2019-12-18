class CreateMutes < ActiveRecord::Migration[5.0]
  def change
    create_table :mutes do |t|
      t.uuid :muter_id, null: false
      t.uuid :mutee_id, null: false
      t.timestamps
    end
    add_index :mutes, %i(muter_id mutee_id), unique: true
  end
end
