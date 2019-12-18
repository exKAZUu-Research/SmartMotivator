class API::NewQuizzesController < API::BaseController
  #
  # 各コース・ジャンルおよびその進捗
  #
  def progress
    user = User.find(params['userId'])
    render_json Genre.stats(user)
  end

  #
  # 学習状況の削除
  #
  def delete_progress
    user = User.find(params['userId'])
    Study.reset_all(user)
    render_json Genre.stats(user)
  end

  #
  # コース一覧
  #
  def courses
    user = User.find(params['userId'])
    courses = []
    if Rails.env.development? || user.developer?
      courses = Course.select(:key, :label).all
    end
    render_json courses
  end

  #
  # クイズ一覧
  #
  def list(course, genre)
    # @show_json = true
    quizzes = Quiz.course_genre(course, genre).order(:label)
    render_json quizzes
  end

  #
  # クイズ一覧（名前と覚えたかどうかなどの情報）
  #
  def memorized(course, genre)
    user = User.find(params['userId'])
    render_json Quiz.memorized(user, course, genre)
  end

  #
  # 学習スタート
  #
  def start(course, genre)
    # @show_json = true
    user = User.find(params['userId'])
    render_json Quiz.choose(user, course, genre, requested_at)
  end

  #
  # 利用開始時のテスト
  #
  def start_pretest
    user = User.find(params['userId'])
    render_json PretestService.prepare_pretest(user)
  end
end
