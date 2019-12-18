class API::ApplicationController < API::BaseController
  def status
    render_json(message: 'OK')
  end
end
