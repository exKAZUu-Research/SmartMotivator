class CreateStudyHistory < ActiveRecord::Migration[5.0]
  def change

    # ユーザの勉強ログを週ごとに保存します
    create_table :study_histories do |t|
      # ユニークキー
      t.string :user_id, null: false
      t.date :week_start, null: false

      # 目標値。今のところ計算には使われません
      t.float :rate_goal, null: true
      t.integer :count_goal, null: true

      # クイズを解くたびに、増やします
      t.integer :correct_count, null: false, default: 0
      t.integer :total_count, null: false, default: 0

      # 先週以降は再計算しなくてもよいのでキャッシュしておきます
      t.boolean :cached, null: false, default: false
      t.float :cache_rate_score, null: false, default: 0
      t.float :cache_count_score, null: false, default: 0
      t.integer :cache_rate_rank, null: false, default: 0
      t.integer :cache_count_rank, null: false, default: 0

      t.timestamp
    end
    add_index :study_histories, [:user_id, :week_start], unique: true
    add_index :study_histories, :week_start
  end
end
