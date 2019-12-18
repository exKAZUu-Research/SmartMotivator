class MultiGenre < ActiveRecord::Migration[5.0]
  def up
    add_column :studies, :genre_list, :string, null: false, array: true, default: []
    execute %(UPDATE studies SET genre_list = ARRAY[genre])
    change_column_default :studies, :genre_list, nil

    remove_index :studies, %i(user_id course genre quiz_key)
    add_index :studies, %i(user_id course quiz_key), unique: true

    remove_column :studies, :genre
  end

  def down
    add_column :studies, :genre, :string, null: false, default: ''
    execute %(UPDATE studies SET genre = genre_list[1])
    change_column_default :studies, :genre, nil

    remove_index :studies, %i(user_id course quiz_key)
    add_index :studies, %i(user_id course genre quiz_key), unique: true

    remove_column :studies, :genre_list
  end
end
