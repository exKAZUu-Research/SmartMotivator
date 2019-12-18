class API::SchoolsController < API::BaseController
  def show(id)
    school = School.find(id)
    render_json school_json(school)
  end

  def school_json(school)
    {
      id: school.id,
      contact_text: school.contact_text,
    }
  end
end
