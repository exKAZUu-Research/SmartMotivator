module QuizzesHelper
  def quizzes_sortable(column, title = nil)
    title ||= column.titleize
    active = column == sort_column
    ascending = active && sort_direction == 'asc'
    direction_html = ascending ? ' ▲ ' : ' ▼ ' if active
    css_class = active ? "current #{sort_direction}" : nil
    direction = ascending ? "desc" : "asc"
    link_to(
      title,
      { course: course_selected, school: school_selected, sort: column, direction: direction },
      class: css_class
    ) << raw(direction_html)
  end

  def quizzes_selectable_school(school = 'None')
    title = school.titleize
    active = school == school_selected
    style = active ? 'font-weight: bold;' : nil
    quizzes_create_link_to(title, course_selected, school, sort_column, sort_direction, style)
  end

  def quizzes_selectable_course(course = 'None')
    title = course_name(course)
    active = course == course_selected
    style = active ? 'font-weight: bold;' : nil
    quizzes_create_link_to(title, course, school_selected, sort_column, sort_direction, style)
  end

  private
  def quizzes_create_link_to(title, course, school, column, direction, style)
    link_to(title, { course: course, school: school, sort: column, direction: direction }, style: style)
  end
end
