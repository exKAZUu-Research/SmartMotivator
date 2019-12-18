class DeleteSchoolBattle < ActiveRecord::Migration[5.1]
  def up
    drop_table :battle_schools
    drop_table :school_battle_members
    drop_table :school_battles
  end
end
