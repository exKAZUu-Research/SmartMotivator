module PretestService
  Info = Struct.new(:name, :count, :genres)
  INFO = [
    Info.new('初級', 10, %w(ngsl_easy_1 ngsl_easy_2 ngsl_easy_3)),
    Info.new('中級', 10, %w(ngsl_normal_1 ngsl_normal_2 ngsl_normal_3 ngsl_normal_4)),
    Info.new('上級', 10, %w(ngsl_hard)),
  ]

  module_function

  def prepare_pretest(user)
    course_key = User::COURSE_ENGLISH
    return [] if user.course != course_key

    quiz_data = []
    INFO.each do |info|
      quiz_keys = QuizGenre.where(genre_key: info.genres).pluck(:quiz_key)
      chosen_keys = quiz_keys.sample(info.count)
      quizzes = Quiz.where(course_key: course_key, key: chosen_keys).to_a
      with_counts = Study.with_counts(course_key, quizzes)
      with_counts.shuffle!
      quiz_data.push(label: info.name,
        quizzes: with_counts)
    end
    return quiz_data
  end
end
