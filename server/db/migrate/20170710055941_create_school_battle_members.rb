class CreateSchoolBattleMembers < ActiveRecord::Migration[5.1]
  def change
    create_table :school_battle_members do |t|
      t.uuid :school_battle_id, null: false
      t.uuid :user_id, null: false

      t.timestamps
    end
    add_index :school_battle_members, [:school_battle_id, :user_id], unique: true
  end
end
