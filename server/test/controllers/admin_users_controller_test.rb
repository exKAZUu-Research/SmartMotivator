require 'test_helper'

class AdminUsersControllerTest < ActionDispatch::IntegrationTest
  def test_index
    user = User.create!(id: SecureRandom.uuid)

    get '/admin/users'
    assert_match user.id, response.body
  end
end
