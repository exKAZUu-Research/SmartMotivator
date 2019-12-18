module ReportsHelper
  def reports_selectable_school(school = 'None')
    title = school.titleize
    active = school == school_selected
    style = active ? 'font-weight: bold;' : nil
    reports_create_link_to(
      title, start_time_selected, end_time_selected, course_selected, school, grouping_selected, style
    )
  end

  def reports_selectable_course(course = 'None', marked = false)
    title = course_name(course)
    active = marked || course == course_selected
    style = active ? 'font-weight: bold;' : nil
    reports_create_link_to(
      title, start_time_selected, end_time_selected, course, school_selected, grouping_selected, style
    )
  end

  def reports_selectable_grouping(grouping = 7)
    title = grouping.to_s + " day(s)"
    active = grouping == grouping_selected
    style = active ? 'font-weight: bold;' : nil
    reports_create_link_to(
      title, start_time_selected, end_time_selected, course_selected, school_selected, grouping, style
    )
  end

  def reports_selectable_time(title, start_time, end_time, id)
    style = <<-CSS
      font: bold 14px;
      background-color: #EEEEEE;
      color: #333333;
      padding: 4px 12px 4px 12px;
      border-top: 1px solid #CCCCCC;
      border-right: 1px solid #333333;
      border-bottom: 1px solid #333333;
      border-left: 1px solid #CCCCCC;
    CSS
    reports_create_link_to(
      title, start_time, end_time, course_selected, school_selected, grouping_selected, style, id
    )
  end

  private
  def reports_create_link_to(title, start_time, end_time, course, school, grouping, style, id = nil)
    link_to(
      title,
      { start_time: start_time.to_date.to_s, end_time: end_time.to_date.to_s, course: course, school: school,
        grouping: grouping },
      style: style, id: id
    )
  end
end
