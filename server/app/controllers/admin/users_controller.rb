class Admin::UsersController < Admin::BaseController
  QUERY_FILTER = %w(course client_version school_id)
  EDITABLE_ATTRIBUTE = %i(
    point
  )

  def index
    @user_query = params.permit(QUERY_FILTER).to_h
    users = User
    users = users.where(@user_query) if @user_query.present?
    prepare_version_count(users)
    @n_users = users.count
    @n_ready_users = users.where(ready: true).count
    @users = users.order('last_access DESC NULLS LAST').preload(:school).page(params[:page]).per(20)
  end

  def show(id)
    prepare_for_show(id)
  end

  def study_histories(id)
    prepare_for_show(id)

    @study_histories = @user.study_histories
        .where(course: @user.course)
        .order(week_start: :desc)
  end

  def user_data(id, kind: nil)
    prepare_for_show(id)

    @all_kinds = @user.user_data.all_kinds.sort
    @data = @user.user_data
        .tap { |scope| break scope.where(kind: kind) if kind }
        .order(time: :desc)
        .page(params[:page]).per(20)
  end

  def studies(id, course: nil, genre: nil)
    prepare_for_show(id)

    @all_pairs = @user.studies.all_course_and_genre.sort
    scope = @user.studies
    scope = scope.where(course: course, genre: genre) if course && genre
    @data = scope
        .order(course: :asc, genre: :asc, quiz_key: :asc)
        .page(params[:page]).per(20)
    @stats = Study.stats(id)
  end

  TIME_FORMAT = '%Y/%m/%d %H:%M:%S'
  def download_studies(id)
    user = User.find(id)
    cols = Study.column_names
    time_str = Time.current.strftime("%Y%m%d_%H%M%S")
    chunked_csv "studies_#{time_str}.csv" do |csv|
      row = cols
      csv << (row.to_csv.encode('Shift_JIS'))
      user.studies.find_each do |study|
        row = cols.map do |col|
          value = study[col]
          if value.respond_to?(:strftime)
            value.strftime(TIME_FORMAT)
          else
            value
          end
        end
        csv << (row.to_csv.encode('Shift_JIS'))
      end
    end
  end

  def edit(id)
    @user = User.find(id)
  end

  def update(id)
    @user = User.find(id)
    if @user.update(params.require(:user).permit(*EDITABLE_ATTRIBUTE))
      redirect_to edit_admin_user_path(@user)
    else
      render 'edit'
    end
  end

  def destroy(id)
    u = User.find(id)
    u.destroy
    redirect_to admin_users_path
  end

  def toggle_developer_role(id)
    @user = User.find(id)
    @user.toggle_developer_role
    @user.save!
    redirect_to edit_admin_user_path(@user)
  end

  def edit_auth(id)
    @user = User.find(id)
    @user.login_id = '%08d' % rand(1_0000_0000)
    @user.password = '%08d' % rand(1_0000_0000)
    if @user.save
      flash.notice = 'ログインIDとパスワードを設定しました'
      redirect_to edit_admin_user_path(@user)
    else
      flash.alert = '上手く設定できませんでした'
      redirect_to edit_admin_users_path(@user)
    end
  end

  private

  def prepare_for_show(id)
    @user = User.find(id)
    @data_count = @user.user_data.count
    @study_count = @user.studies.count
  end

  CountAndLastAccess = Struct.new(:count, :last_access)
  def prepare_version_count(user_scope)
    count_scope = user_scope
      .group(:client_version)
      .select('client_version, count(id) as count, max(last_access) as last_access')

    @all_user_hash = {}
    count_scope.sort_by { |x| Gem::Version.new(x.client_version[/\S+/]) }.each do |record|
      @all_user_hash[record.client_version] = CountAndLastAccess.new(record.count, record.last_access)
    end
    @ready_user_hash = {}
    count_scope.where(ready: true).each do |record|
      @ready_user_hash[record.client_version] = CountAndLastAccess.new(record.count, record.last_access)
    end
  end

  def chunked_csv(file_name)
    enum = Enumerator.new do |y|
      yield y
    end

    time_str = Time.current.strftime("%Y%m%d_%H%M%S")
    headers["Cache-Control"] = "no-cache"
    headers["Transfer-Encoding"] = "chunked"
    headers["Content-Type"] = "text/csv; charset=Shift_JIS"
    headers["Content-Disposition"] = %(attachment; filename="#{file_name}")
    self.response_body = Rack::Chunked::Body.new(enum)
  end
end
