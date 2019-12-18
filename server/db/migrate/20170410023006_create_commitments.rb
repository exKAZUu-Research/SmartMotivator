class CreateCommitments < ActiveRecord::Migration[5.0]
  def change
    create_table :commitments do |t|
      t.uuid "user_id", null: false
      t.date "start_commitment"
      t.date "end_commitment"
      t.integer "count_goal"
      t.integer "correct_count", null: false, default: 0
      t.integer "total_count", null: false, default: 0
      t.string "course", null: false
    end
  end
end
