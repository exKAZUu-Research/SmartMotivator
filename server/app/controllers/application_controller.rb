class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def index
    render plain: I18n.t(:app_name)
  end
end
