require 'test_helper'

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  def test_root
    get '/'
    assert_response :ok
  end

  def test_status
    get '/status.json'
    assert_response :ok
  end
end
