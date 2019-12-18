SELECT
    user_id
  , SUM(correct_count) as correct_count
  , SUM(total_count) as total_count
  , SUM(total_spent_time) as total_spent_time
  , SUM(memorized_word) as memorized_word
FROM users AS u
LEFT JOIN study_histories AS s
  ON u.id = s.user_id AND u.course = s.course
GROUP BY user_id
