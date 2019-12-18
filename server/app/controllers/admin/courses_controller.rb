class Admin::CoursesController < Admin::BaseController
  def index
    @courses = Course.all
    @n_users = User
      .group(:course)
      .select('count(*) as count, course')
      .each_with_object({}) { |u, h| h[u.course] = u.count }
    @n_users.default = 0
  end

  def new
    @course = Course.new(editable: true)
  end

  def create
    @course = Course.new(editable: true)
    @course.assign_attributes(params.require(:course).permit(:key, :label))
    if @course.save
      redirect_to admin_course_path(@course.key)
    else
      render 'new'
    end
  end

  def show(id)
    @course = Course.find_by_key!(id)
  end

  def edit(id)
    @course = Course.find_by_key!(id)
  end

  def update(id)
    @course = Course.find_by_key!(id)
  end

  def update_quiz(id)
    @course = Course.find_by_key!(id)
    result = QuizExcelImporter.import(@course.key, params[:file])
    redirect_to admin_course_path(@course.key)
  end

  def download_quiz(id)
    headers["Cache-Control"] = "no-cache"
    # headers["Transfer-Encoding"] = "chunked"
    headers["Content-Type"] = "application/vnd.ms-excel"
    headers["Content-disposition"] = %(attachment; filename="#{id}_quiz_data.xlsx")

    QuizExcelImporter.export(id) do |io|
      self.response_body = io
    end
  end

  def quizzes(id, genre_key: nil)
    course = Course.find_by_key!(id)
    quizzes = course.quizzes
    if genre_key
      keys = QuizGenre.select_quiz_keys(course.key, genre_key)
      quizzes = quizzes.where(key: keys)
      @title = course.genres.find_by_key!(genre_key).label
    else
      @title = course.label
    end
    @quizzes = quizzes.page(params[:page]).per(20)
  end

  def destroy(id)
    @course = Course.find_by_key!(id)
    if @course.editable && @course.destroy
      redirect_to admin_courses_path
    else
      redirect_to admin_course_path(@course.key)
    end
  end
end
