module AdminHelper
  def page_title(title)
    @title = title
    content_tag(:h1, title, class: 'page-header')
  end

  def course_name(course)
    @course_name ||= begin
      Course.all.each_with_object(Hash.new) do |c, hash|
        hash[c.key] = c.label
      end
    end
    @course_name[course] || ''
  end

  def role_name(role)
    I18n.t("words.roles.#{role.presence || 'default'}")
  end
end
