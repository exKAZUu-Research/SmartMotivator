require 'test_helper'

class ApiQuizzesControllerTest < ActionDispatch::IntegrationTest
  def test_create
    course, genre = Study::COURSE_AND_GENRE_FOR_TEST
    user = User.create!(id: SecureRandom.uuid, course: course, ready: true)

    assert_equal 1, UserData.count
    assert_equal 0, Study.count
    keys = QuizGenre.pluck_quiz_keys(course, genre)

    post "/quizzes/#{course}/#{genre}.json", params: {
      userId: user.id,
      time: Time.current.to_i * 1000,
      answers: gen_answers(3, 2, keys),
    }

    assert_equal 2, UserData.count
    h = StudyHistory.create_once(user.id, user.course, Calendar.start_of_week(Date.today))

    assert_equal 3, h.total_count
    assert_equal 2, h.correct_count
    assert Study.count > 0
  end

  private

  def gen_answers(n_total, n_correct, keys)
    ret = []
    n_correct.times do
      ret << { correct: true, spentTime: rand(2000), quizKey: keys.sample, answerIndex: 0 }
    end
    (n_total - n_correct).times do
      ret << { correct: false, spentTime: rand(2000), quizKey: keys.sample, answerIndex: rand(1..3) }
    end
    return ret
  end
end
