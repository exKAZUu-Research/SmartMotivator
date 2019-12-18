class ChangeScoreToNullable < ActiveRecord::Migration[5.0]
  def change
    change_column :study_histories, :cache_rate_score, :float, null: true
    change_column :study_histories, :cache_count_score, :float, null: true
    change_column :study_histories, :cache_spent_time_score, :float, null: true
  end
end
