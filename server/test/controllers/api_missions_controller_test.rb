require 'test_helper'

class ApiMissionsControllerTest < ActionDispatch::IntegrationTest
  def test_show
    create_course

    user = create_user(nil)
    mission_info = get_mission(user.id)
    assert_equal 4, mission_info['missions'].size

    user = create_user(User::EXP_MODE_OLD_MISSION)
    mission_info = get_mission(user.id)
    assert_equal 2, mission_info['missions'].size

    user = create_user(User::EXP_MODE_ALL_ENABLED)
    mission_info = get_mission(user.id)
    assert_equal 2, mission_info['missions'].size
  end

  def test_show_missions_with_difficulty_basic1
    create_course
    answers = Array.new(10) { |i| { 'correct': i < 8, 'spentTime': 1000 } }
    sub_test_missions_with_difficulty(answers, 9, 2000, 9)
  end

  def test_show_missions_with_difficulty_basic2
    create_course
    answers = Array.new(10) { |i| { 'correct': i < 5, 'spentTime': 1000 } }
    sub_test_missions_with_difficulty(answers, 6, 2000, 6)
  end

  def test_show_missions_with_difficulty_perfect
    create_course
    answers = Array.new(10) { |i| { 'correct': true, 'spentTime': 1000 } }
    sub_test_missions_with_difficulty(answers, 10, 2000, 10)
  end

  def test_show_missions_with_difficulty_varied_spent_time
    create_course
    answers = Array.new(10) { |i| { 'correct': i < 8, 'spentTime': 1000 * (i + 1) } }
    sub_test_missions_with_difficulty(answers, 9, 6000, 7)
  end

  def test_show_missions_with_difficulty_long_spent_time
    create_course
    answers = Array.new(10) { |i| { 'correct': true, 'spentTime': 100_000 } }
    sub_test_missions_with_difficulty(answers, 10, 6000, 1)
  end

  def test_create
    create_course
    answers = Array.new(10,
      quizKey: 'wooden',
      correct: true,
      spentTime: 1000,
      memorized: 0)

    user = create_user(nil)
    mission_info_list = post_mission(user.id, answers)
    final_missions = mission_info_list[2]['missions']
    assert_equal 4, final_missions.size

    user = create_user(User::EXP_MODE_OLD_MISSION)
    mission_info_list = post_mission(user.id, answers)
    final_missions = mission_info_list[2]['missions']
    assert_equal 2, final_missions.size

    user = create_user(User::EXP_MODE_ALL_ENABLED)
    mission_info_list = post_mission(user.id, answers)
    final_missions = mission_info_list[2]['missions']
    assert_equal 2, final_missions.size
    assert_equal 2, final_missions[0]['goalValue'] - final_missions[0]['startValue']
  end

  def sub_test_missions_with_difficulty(answers, expected_quiz_count_correct,
      expected_threshold, expected_quiz_count_fast_correct)
    user = create_user(User::EXP_MODE_ALL_ENABLED)
    create_quiz_data(user, answers)
    mission_info = get_mission(user.id)

    mission = mission_info['missions'][0]
    assert_equal MissionService::TYPE_MULTI_CORRECT, mission['type']
    assert_equal expected_quiz_count_correct, mission['quizCount']

    mission = mission_info['missions'][1]
    assert_equal MissionService::TYPE_MULTI_FAST_CORRECT, mission['type']
    assert_equal expected_threshold, mission['threshold']
    assert_equal expected_quiz_count_fast_correct, mission['quizCount']
  end

  def create_user(experiment_mode)
    user = User.create!(
      id: SecureRandom.uuid,
      experiment_mode: experiment_mode,
      course: User::COURSE_ENGLISH,
      ready: true
    )
  end

  def create_course
    course = Course.where(key: User::COURSE_ENGLISH).first_or_create! do |c|
      c.label = 'english'
    end
    course.genres.create!(key: 'easy', label: 'easy', quiz_size: 10)
  end

  def create_quiz_data(user, answers)
    quiz_data = { answers: answers }
    user.user_data.create!(kind: 'quiz', value: quiz_data, time: Time.now)
  end
end
