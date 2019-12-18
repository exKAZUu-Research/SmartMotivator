class AddMemorizedWord < ActiveRecord::Migration[5.0]
  def change
    add_column :study_histories, :memorized_word_goal, :integer
    add_column :study_histories, :memorized_word, :integer, null: false, default: 0
    add_column :study_histories, :cache_memorized_word_rank, :integer, null: false, default: 0

    remove_column :study_histories, :cache_rate_score, :float, null: false, default: 0
    remove_column :study_histories, :cache_count_score, :float, null: false, default: 0
    remove_column :study_histories, :cache_spent_time_score, :float, null: false, default: 0

    reversible do |dir|
      dir.up do
        execute "UPDATE study_histories SET cached = 't' WHERE cached = 'f'"
      end
    end
  end
end
