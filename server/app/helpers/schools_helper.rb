module SchoolsHelper
  attr_accessor :current_school
  attr_accessor :current_permission

  def signed_in?
    current_permission != nil
  end

  def page_title(title)
    @title = title
    content_tag(:h1, title, class: 'page-header')
  end

  def percent(a, b)
    if b == 0
      '-'
    else
      "#{100 * a / b}%"
    end
  end
end
