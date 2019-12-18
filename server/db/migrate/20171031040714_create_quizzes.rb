class CreateQuizzes < ActiveRecord::Migration[5.1]
  def change
    enable_extension "pgcrypto"

    create_table :courses, id: :uuid do |t|
      t.string  :key,          null: false
      t.string  :label,        null: false
      t.string  :public_label, null: false
      t.integer :quiz_size,    null: false
    end
    add_index :courses, :key, unique: true

    create_table :genres, id: :uuid do |t|
      t.string  :key,        null: false
      t.string  :course_key, null: false
      t.string  :label,      null: false
      t.integer :ordering,   null: false, default: 0
    end
    add_index :genres, %i(course_key key), unique: true

    create_table :quizzes, id: :uuid do |t|
      t.string :key,        null: false
      t.string :course_key, null: false

      t.string  :label,              null: false
      t.string  :sub_label,          null: true
      t.string  :pre_text,           null: true
      t.string  :problem,            null: false
      t.string  :input_type,         null: false
      t.string  :answers,            null: false, default: [], array: true
      t.integer :answer_size,        null: false, default: 0
      t.integer :correct_index,      null: false, default: 0
      t.boolean :shuffle,            null: false, default: false
      t.string  :commentary_label,   null: true
      t.string  :commentary,         null: true
      t.integer :default_percentage, null: true
      t.string  :font,               null: true
      t.jsonb   :images,             null: false, default: {}
    end
    add_index :quizzes, %i(course_key key), unique: true

    create_table :quiz_genres, id: :uuid do |t|
      t.string :course_key, null: false
      t.string :genre_key, null: false
      t.string :quiz_key, null: false
    end
    add_index :quiz_genres, %i(course_key genre_key quiz_key), unique: true
  end
end
