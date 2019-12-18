class Admin::SchoolsController < Admin::BaseController
  EDITABLE_ATTRIBUTE = %i(
    internal_name
    is_experiment
    is_experiment2
    quiz_editable
    use_beacon
    course
    contact_text

    prefix
    email_domain
    login_id
    login_password

    read_password
    write_password
  )

  def index
    @schools = School.order(created_at: :desc).all
  end

  def new
    @school = School.new
  end

  def create
    @school = School.new(params.require(:school).permit(*EDITABLE_ATTRIBUTE))
    if @school.save
      redirect_to admin_schools_path
    else
      render 'new'
    end
  end

  def show
    @school = School.find(params[:id])
  end

  def edit
    @school = School.find(params[:id])
  end

  def update
    @school = School.find(params[:id])
    if @school.update(params.require(:school).permit(*EDITABLE_ATTRIBUTE))
      redirect_to admin_school_path(@school)
    else
      render 'edit'
    end
  end

  def destroy
    @school = School.find(params[:id])
    @school.destroy
  end
end
