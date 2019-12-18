class Admin::QuizzesController < Admin::BaseController
  helper QuizzesHelper
  helper_method :sort_column, :sort_direction, :course_selected, :school_selected
  def show
    order_by = sort_column == 'position' ? '' : params[:sort] + " " + params[:direction]
    query_studies = Study
                      .joins(:user)
                      .select(
                        "quiz_key,
                         genre,
                         SUM(total_count) as sum_total_count,
                         SUM(correct_count) as sum_correct_count,
                         (SUM(correct_count::NUMERIC)/SUM(total_count::NUMERIC)) as ratio,
                         COUNT(quiz_key) as count_user,
                         COUNT(CASE WHEN correct_count > 0 THEN 1 END) as count_correct_user")
                      .group(:quiz_key, :genre)
                      .order(order_by)
    # Add where statements if course or school is selected
    if course_selected != "None"
      query_studies = query_studies.where(course: course_selected)
    end
    if school_selected != "None"
      school_id = School.where(internal_name: school_selected).pluck(:id)
      query_studies = query_studies.where(users: { school_id: school_id })
    end
    @studies = query_studies.page(params[:page]).per(20)

    @studies_courses = Study.select(:course).distinct.pluck(:course)
    @schools = School.select(:internal_name).distinct.pluck(:internal_name)
  end

  protected
  def sort_column
    params[:sort].presence || 'position'
  end

  def sort_direction
    %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
  end

  def school_selected
    params[:school].presence || 'None'
  end

  def course_selected
    params[:course].presence || 'None'
  end
end
