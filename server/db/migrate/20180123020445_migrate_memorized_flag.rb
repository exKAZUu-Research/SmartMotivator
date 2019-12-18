class MigrateMemorizedFlag < ActiveRecord::Migration[5.1]
  def up
    # 覚えた問題を新システムの覚えた問題に引き継ぐ（2問以上連続正解をmemorizedにする）
    execute <<~SQL
      UPDATE studies SET memorized = 't' WHERE consecutive_correct_count >= 2
    SQL
    # 単語を適切なライトナーボックスに入れる（連続性回数+1の箱に入れる）
    execute <<~SQL
      UPDATE studies SET leitner_box = consecutive_correct_count + 1 WHERE leitner_box = 0
    SQL
  end
end
