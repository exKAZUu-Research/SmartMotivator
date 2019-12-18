class Schools::SessionsController < Schools::BaseController
  def new
  end

  def create
    password = params[:password]
    case password.presence
    when current_school.write_password
      session[school_session_key] = password
      redirect_to school_path
    when current_school.read_password
      session[school_session_key] = password
      redirect_to school_path
    else
      flash[:alert] = "パスワードが間違っています"
      redirect_to new_school_session_path
    end
  end

  def destroy
    session.delete(school_session_key)
    redirect_to school_path
  end
end
