class Schools::RootController < Schools::BaseController
  def show
  end

  def edit
  end

  def update
    h = params.require('school').permit(:display_name)
    current_school.assign_attributes(h)
    if current_school.save
      redirect_to school_path(current_school)
    else
      render
    end
  end
end
