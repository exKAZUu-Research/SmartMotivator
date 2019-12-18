class Schools::QuizzesController < Schools::BaseController
  def index
    @course = Course.find_by_key!(current_school.course)
  end

  def show(id)
    genre_key = id

    course = Course.find_by_key!(current_school.course)
    keys = QuizGenre.select_quiz_keys(course.key, genre_key)
    @title = course.genres.find_by_key!(genre_key).label
    @quizzes = course.quizzes.where(key: keys).page(params[:page]).per(20)
  end

  def create
    course = Course.find_by_key!(current_school.course)
    if course.editable
      begin
        QuizExcelImporter.import(course.key, params[:file])
      rescue => e
        if PG::Error === e.cause
          flash[:alert] = e.cause.message
        else
          flash[:alert] = e.message
        end
      end
    else
      flash[:alert] = 'クイズを変更できません'
    end
    redirect_to school_quizzes_path
  end
end
