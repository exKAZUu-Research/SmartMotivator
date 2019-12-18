require 'csv'

class Schools::UsersController < Schools::BaseController
  READ_ONLY_ACTIONS = %i(index show download_csv)

  before_action :require_read_permission, only: READ_ONLY_ACTIONS
  before_action :require_write_permission, except: READ_ONLY_ACTIONS

  def index
    @teachers = current_school.teachers
    @users = current_school.users
    if (teacher_id = params['teacher'].presence)
      @users = @users.where(teacher_id: teacher_id.to_s)
    end
    case
    when @current_school.prefix.present?
      @users = @users.order(login_id: :asc)
    when @current_school.email_domain.present?
      @users = @users.order(email: :asc)
    end
  end

  def published
    @teacher_exits = current_school.teachers.exists?
    @users = current_school.users.preload(:teacher).order(login_id: :asc)
  end

  def new
    @teachers = current_school.teachers
    @user = current_school.users.with_course.build
  end

  def create
    props = params.require(:user).permit(:student_id, :teacher_id, :password)
    @user = current_school.users.with_course.build(props)
    if @user.save
      redirect_to published_school_users_path
    else
      @teachers = current_school.teachers
      render 'new'
    end
  end

  def show
    @user = current_school.users.find(params[:id])
    @histories = @user.study_histories
      .where(['week_start <= :now', now: Time.current])
      .where(course: @user.course)
      .order(week_start: :asc)
      .limit(10)
  end

  def edit
    @teachers = current_school.teachers
    @user = current_school.users.find(params[:id])
  end

  def update
    @user = current_school.users.find(params[:id])
    props = params.require(:user).permit(:login_id, :teacher_id, :password)
    if @user.update(props)
      redirect_to published_school_users_path
    else
      @teachers = current_school.teachers
      render 'edit'
    end
  end

  def destroy
    user = current_school.users.find(params[:id])
    user.destroy if current_school.can_destroy?(user)
    redirect_to published_school_users_path
  end

  def import
  end

  def import!
    confirmed = params['confirmed'] == 'true'
    student_id = params['student_id']
    if student_id.blank?
      flash.alert = 'IDが指定されていません'
      render 'import'
      return
    end

    @student_ids = student_id.split("\n").map(&:strip).select(&:present?)
    login_ids = @student_ids.map { |x| @current_school.login_id_of(x) }.compact
    if !confirmed
      @users = User.where(login_id: login_ids).map { |u| [u.login_id, u] }.to_h
      render 'confirm_import'
      return
    end

    # create users
    exist_login_ids = User.where(login_id: login_ids).pluck(:login_id)
    new_login_ids = login_ids - exist_login_ids
    import_data = new_login_ids.map do |login_id|
      props = { login_id: login_id, password: gen_password }
      current_school.users.with_course.build(props)
    end
    result = User.import(import_data)
    flash.notice = "#{import_data.size}人の学生を新規登録しました。"
    redirect_to published_school_users_path
  end

  def download_csv
    enum = Enumerator.new do |y|
      row = [
        'ログインID',
        'ニックネーム',
        '時刻',
        'カテゴリー',
        '解答数',
        '正答数',
      ]
      y << (row.to_csv.encode('Shift_JIS'))
      scope = UserData.where(user_id: current_school.users.select(:id), kind: 'quiz')
      scope.preload(:user).find_each do |ud|
        row = [
          ud.user.login_id,
          ud.user.name,
          ud.time.strftime('%Y/%m/%d %H:%M'),
          ud.value['genre'],
          ud.value['answers'].size,
          ud.value['answers'].count { |a| a['correct'] },
        ]
        y << (row.to_csv.encode('Shift_JIS'))
      end
    end

    time_str = Time.current.strftime("%Y%m%d_%H%M%S")
    file_name = "studies_#{time_str}.csv"
    headers["Cache-Control"] = "no-cache"
    headers["Transfer-Encoding"] = "chunked"
    headers["Content-Type"] = "text/csv; charset=Shift_JIS"
    headers["Content-Disposition"] = %(attachment; filename="#{file_name}")
    self.response_body = Rack::Chunked::Body.new(enum)
  end

  private

  def gen_password
    '%08d' % rand(1_0000_0000)
  end
end
