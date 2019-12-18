SELECT
    u.id as user_id
  , COALESCE(SUM(correct_count), 0) as correct_count
  , COALESCE(SUM(total_count), 0) as total_count
  , COALESCE(SUM(total_spent_time), 0) as total_spent_time
  , COALESCE(SUM(memorized_word), 0) as memorized_word
FROM users AS u
LEFT JOIN study_histories AS s
  ON u.id = s.user_id AND u.course = s.course
GROUP BY u.id
