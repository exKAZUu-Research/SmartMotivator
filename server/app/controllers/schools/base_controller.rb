module Schools
  class BaseController < ActionController::Base
    attr_accessor :current_school
    attr_accessor :current_permission

    before_action :set_current_school

    helper SchoolsHelper
    layout 'schools_layout'

    def set_current_school
      @current_school = School.find(params[:school_id])
      password = session[school_session_key].presence
      @current_permission =
        case password
        when current_school.write_password
          School::PERMISSION_WRITE
        when current_school.read_password
          School::PERMISSION_READ
        end
    end

    def require_read_permission
      if @current_permission == School::PERMISSION_READ || @current_permission == School::PERMISSION_WRITE
        # do nothing
      else
        redirect_to new_school_session_path
      end
    end

    def require_write_permission
      if @current_permission == School::PERMISSION_WRITE
        # do nothing
      else
        redirect_to new_school_session_path
      end
    end

    def default_url_options
      { school_id: current_school.id }
    end

    def school_session_key
      "school/#{current_school.id}"
    end
  end
end
