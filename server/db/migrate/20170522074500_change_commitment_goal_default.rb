class ChangeCommitmentGoalDefault < ActiveRecord::Migration[5.0]
  def up
    execute "DELETE FROM commitments WHERE start_commitment IS NULL OR end_commitment IS NULL"
    change_column :commitments, :start_commitment, :date, null: false
    change_column :commitments, :end_commitment, :date, null: false
    change_column :commitments, :count_goal, :integer, null: false, default: 0
  end

  def down
    change_column :commitments, :count_goal, :integer, null: true, default: nil
    change_column :commitments, :end_commitment, :date, null: true
    change_column :commitments, :start_commitment, :date, null: true
  end
end
