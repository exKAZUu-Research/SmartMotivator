class ChangeCommitmentsColumnsDateToTimestamp < ActiveRecord::Migration[5.0]
  def change
    change_column :commitments, :start_commitment, :timestamp
    change_column :commitments, :end_commitment, :timestamp
  end
end
