class Schools::TeachersController < Schools::BaseController
  EDITABLE_FIELDS = %i(name)

  before_action :require_write_permission

  def index
    @teachers = current_school.teachers
  end

  def new
    @teacher = current_school.teachers.new
  end

  def create
    @teacher = current_school.teachers.new(params.require(:teacher).permit(*EDITABLE_FIELDS))
    if @teacher.save
      redirect_to school_teachers_path(current_school)
    else
      render 'new'
    end
  end

  def edit
    @teacher = current_school.teachers.find(params[:id])
  end

  def update
    @teacher = current_school.teachers.find(params[:id])
    if @teacher.update(params.require(:teacher).permit(*EDITABLE_FIELDS))
      redirect_to school_teachers_path(current_school)
    else
      render 'edit'
    end
  end

  def destroy
    teacher = current_school.teachers.find(params[:id])
    teacher.destroy
    redirect_to school_teachers_path(current_school)
  end
end
