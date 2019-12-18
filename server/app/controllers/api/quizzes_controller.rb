class API::QuizzesController < API::BaseController
  def create(course, genre)
    user = User.find(params['userId'])
    time = msec_to_timestamp(params['time'])
    answers = Array.wrap(params['answers']).map do |hash|
      quiz_key = hash['quizKey']
      correct = to_bool(hash['correct'])
      spent_time = hash['spentTime'].to_i
      Study::Answer.new(quiz_key, correct, spent_time)
    end

    studies = Study.update_studies(user, course, genre, answers, requested_at)

    value = { course: course, genre: genre, answers: params['answers'].as_json }
    UserData.create(user_id: user.id, kind: UserData::KIND_QUIZ, value: value, time: time)

    render_json studies
  end

  private

  def to_bool(value)
    case value
    when true, /true/i
      true
    else
      false
    end
  end

  def msec_to_timestamp(value)
    Time.zone.at(Rational(value.to_i, 1000))
  end
end
