class CreateStudies < ActiveRecord::Migration[5.0]
  def change
    create_table :studies do |t|
      t.uuid "user_id", null: false
      t.string "course", null: false
      t.string "genre", null: false
      t.string "quiz_key", null: false
      t.integer "answer_count", default: 0, null: false
      t.integer "consecutive_correct_count", default: 0, null: false
      t.datetime "available_at", null: false
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
    end
    add_index :studies, %i(user_id course genre quiz_key), unique: true
  end
end
