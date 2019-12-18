class CreateSchoolBattles < ActiveRecord::Migration[5.1]
  def change
    opts = { id: :uuid, default: -> { "uuid_generate_v4()" } }

    create_table :school_battles, opts do |t|
      t.string :event_name, null: false, default: ''
      t.string :course, null: false
      t.date :started_date, null: false
      t.date :finished_date, null: false

      t.timestamps
    end

    create_table :battle_schools, opts do |t|
      t.uuid :school_battle_id, null: false
      t.uuid :school_id, null: false

      t.timestamps
    end
    add_index :battle_schools, [:school_battle_id, :school_id], unique: true
  end
end
