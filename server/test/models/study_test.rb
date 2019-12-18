require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def test_update_studies
    week_start = Calendar.start_of_week(Date.today)
    course, genre = Study::COURSE_AND_GENRE_FOR_TEST
    quiz_key = QuizGenre.pluck_quiz_keys(course, genre).first
    assert_not_nil quiz_key
    user = User.create!(
      id: SecureRandom.uuid,
      course: course,
      ready: true,
    )
    do_answer = ->(correct) {
      answers = [Study::Answer.new(quiz_key, correct, 0)]
      Study.update_studies(user, course, genre, answers, Time.current)
    }

    start_ts = Time.current

    assert_equal 0, Study.count
    do_answer.call(false)
    assert_equal 1, Study.count
    study = Study.selectable(user.id, course, genre).where(quiz_key: quiz_key).take
    assert_not_nil study
    assert_equal 1, study.leitner_box

    history = StudyHistory.create_once(user.id, course, week_start)
    assert_not_nil history
    assert_equal 0, history.memorized_word

    # memory!
    (Study::NB_LEITNER_BOXES - 1).times do
      do_answer.call(true)
    end
    history.reload
    assert_equal 0, history.memorized_word
    study = Study.selectable(user.id, course, genre).where(quiz_key: quiz_key).take
    assert_equal Study::MEMORIZED_BOX_INDEX - 1, study.leitner_box

    do_answer.call(true)
    history.reload
    assert_equal 1, history.memorized_word
    study = Study.selectable(user.id, course, genre).where(quiz_key: quiz_key).take
    assert_equal Study::MEMORIZED_BOX_INDEX, study.leitner_box

    # forget
    do_answer.call(false)
    history.reload
    assert_equal 0, history.memorized_word
    study = Study.selectable(user.id, course, genre).where(quiz_key: quiz_key).take
    assert_equal Study::MEMORIZED_BOX_INDEX - 1, study.leitner_box

    # leitner_box should never be smaller than 1
    (Study::MEMORIZED_BOX_INDEX - 1).times do
      do_answer.call(false)
    end
    study = Study.selectable(user.id, course, genre).where(quiz_key: quiz_key).take
    assert_equal 1, study.leitner_box
  end
end
