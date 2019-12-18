class CreateGenreCompletions < ActiveRecord::Migration[5.1]
  def change
    create_table :genre_completions do |t|
      t.uuid :user_id, null: false
      t.string :course, null: false
      t.string :genre, null: false

      t.timestamps
    end
  end
end
