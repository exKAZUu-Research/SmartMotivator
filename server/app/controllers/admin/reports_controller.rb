class Admin::ReportsController < Admin::BaseController
  include ChartsHelper
  helper ReportsHelper
  helper_method :start_time_selected, :end_time_selected, :grouping_selected, :course_selected, :school_selected

  def show
    # Create dates - (non-)grouped
    dates = create_dates(start_time_selected, end_time_selected, grouping_selected)

    user_information(dates)
    quizzes_amount(dates)
    filter_options
  end

  def user_information(dates)
    # Find relevant user information for active, new, not finished signed up and total users
    new_users_query = User
                  .select("id, DATE(created_at) as created_at_date")
                  .where(created_at: start_time_selected..end_time_selected)
                  .where(ready: true)

    active_users_query = UserData
                      .joins(:user)
                      .select("DATE(user_data.created_at) as created_at_date, user_id")
                      .order("DATE(user_data.created_at)")
                      .group("DATE(user_data.created_at), user_id")
                      .where(created_at: start_time_selected..end_time_selected.end_of_day)
                      .where(users: { ready: true })

    not_finished_users_query = User
                                .select("id, DATE(created_at) as created_at_date")
                                .where(created_at: start_time_selected..end_time_selected)
                                .where(ready: false)

    total_users_before_query = User
                          .where.not(created_at: (start_time_selected + grouping_selected.days - 1)..end_time_selected)
                          .where(ready: true)

    # Add where statements if course or school is selected
    total_users_before_query =
      course_school_filter(total_users_before_query, true,  true, course_selected, school_selected)
    new_users_query          =
      course_school_filter(new_users_query,          true,  true, course_selected, school_selected)
    not_finished_users_query =
      course_school_filter(not_finished_users_query, true,  true, course_selected, school_selected)
    active_users_query       =
      course_school_filter(active_users_query,       false, true, course_selected, school_selected)

    # Query to hashes, key = date, value = user_ids
    new_users_hash = Hash.new { |h, k| h[k] = [] }
    new_users_query.map { |u| new_users_hash[u.created_at_date.to_s] << u.id }
    active_users_hash = Hash.new { |h, k| h[k] = [] }
    active_users_query.map { |u| active_users_hash[u.created_at_date.to_s] << u.user_id }
    not_finished_users_hash = Hash.new { |h, k| h[k] = [] }
    not_finished_users_query.map { |u| not_finished_users_hash[u.created_at_date.to_s] << u.id }

    # merge hashes based on grouping
    if grouping_selected != 1
      new_users_hash = group_hash(start_time_selected, end_time_selected, grouping_selected, new_users_hash,
        "array")
      active_users_hash = group_hash(start_time_selected, end_time_selected, grouping_selected, active_users_hash,
        "array")
      not_finished_users_hash = group_hash(start_time_selected, end_time_selected, grouping_selected,
        not_finished_users_hash, "array")
    end

    # Clean active user hash - remove identical values to new_users (because new user are active)
    new_users_hash.each do |k, values|
      if active_users_hash.has_key? k
        values.each do |v|
          active_users_hash[k].delete(v)
          active_users_hash.delete(k) if active_users_hash[k].empty?
        end
      end
    end

    # Create arrays for chart, every day one entry for active, new and inactive users in arrays
    chart_x, chart_y = create_chart_data(dates, [new_users_hash, active_users_hash, not_finished_users_hash], "array")

    # Save for javascript
    gon.labels = chart_x
    gon.new_users_data = chart_y[0]
    gon.active_users_data = chart_y[1]
    gon.not_finished_users_data = chart_y[2]

    # Calculate inactive users based on chart data
    inactive_users_data = []
    gon.active_users_data.each_with_index do | active_users, index |
      inactive_users_data << total_users_before_query.count - active_users - gon.new_users_data[index] if index == 0
      inactive_users_data << inactive_users_data[index - 1] - active_users +
                                gon.active_users_data[index - 1] + gon.new_users_data[index - 1] if index > 0
    end

    gon.inactive_users_data = inactive_users_data
  end

  def quizzes_amount(dates)
    quizzes_query = UserData
                      .joins(:user)
                      .select("DATE(user_data.created_at) as created_at_date, value ->> 'answers' AS answers")
                      .order("DATE(user_data.created_at)")
                      .where(created_at: start_time_selected..end_time_selected.end_of_day)
                      .where(kind: 'quiz')

    # Add where statements if course or school is selected
    course_filtered_queries = course_school_filter(quizzes_query, true, true, course_selected, school_selected)

    # Query to hashes, key = date, value = summed up correct quizzes
    quizzes_query_hash = Hash.new { |h, k| h[k] = 0 }
    quizzes_query.map do | q |
      quizzes_query_hash[q.created_at_date.to_s] = quizzes_query_hash[q.created_at_date.to_s] +
        q.answers.scan(/\"correct\": true/).length
    end

    # merge hashes based on grouping
    if grouping_selected != 1
      quizzes_query_hash = group_hash(start_time_selected, end_time_selected, grouping_selected, quizzes_query_hash,
        "numeric")
    end

    # Create arrays for chart, every day one entry for active, new and inactive users in arrays
    chart_x, chart_y = create_chart_data(dates, [quizzes_query_hash], "numeric")

    # Save for javascript
    gon.labels_chart_quizzes_average = chart_x
    # Calculate averages - reuse data from other chart
    gon.chart_quizzes_average_active_new = calc_average(chart_y[0], [gon.new_users_data, gon.active_users_data])
    gon.chart_quizzes_average_all = calc_average(chart_y[0],
      [gon.new_users_data, gon.active_users_data, gon.inactive_users_data])
  end

  def filter_options
    # Filter options
    courses_query = Study.select(:course).distinct
    school_query = School.select(:internal_name).distinct

    # Add where statements if course or school is selected
    school_query = course_filter(school_query, true, course_selected)
    # courses_query not included as a course selection
    # should not reduce the amount of available courses

    courses_query = school_filter(courses_query, false, school_selected)
    # school_query not included as a school selection
    # should not reduce the amount of available schools

    # Filter variables
    @studies_courses = courses_query.pluck(:course)
    @schools = school_query.pluck(:internal_name)
  end

  private
  def query_add_course(query, course)
    query.where(course: course)
  end

  def query_add_school(query, school_id)
    query.where(users: { school_id: school_id })
  end

  def course_school_filter(query, course_type_filter, school_type_filter, course, school)
    query = course_filter(query, course_type_filter, course)
    school_filter(query, school_type_filter, school)
  end

  def course_filter(query, course_type_filter, course)
    result_query = []
    if course != "None"
      if course_type_filter
        query = query.where(course: course)
      else
        query = query.where(users: { course: course_selected })
      end
    else
      query
    end
  end

  def school_filter(query, school_type_filter, school)
    if school != "None"
      if school_type_filter
        school_id = School.where(internal_name: school_selected).pluck(:id)
        query = query.where(users: { school_id: school_id })
      else
        query = School.where(internal_name: school)
      end
    else
      query
    end
  end

  def calc_average(solved_quizzes_array, user_arrays)
    result = []
    user_sum = user_arrays.transpose.map { | e | e.inject(:+) }
    solved_quizzes_array.each_with_index do | solved, index |
      result << (solved.to_f / user_sum[index]).round(2) if user_sum[index] > 0
      result << 0 if user_sum[index] == 0
    end
    return result
  end

  protected
  def grouping_selected
    if value = params[:grouping].presence
      value.to_i
    else
      1
    end
  end

  def start_time_selected
    if value = params[:start_time].presence
      value.to_date.beginning_of_day
    else
      Date.today.beginning_of_day - 6.days
    end
  end

  def end_time_selected
    if value = params[:end_time].presence
      value.to_date.end_of_day
    else
      Date.today.end_of_day
    end
  end

  def school_selected
    params[:school].presence || 'None'
  end

  def course_selected
    params[:course].presence || 'None'
  end
end
