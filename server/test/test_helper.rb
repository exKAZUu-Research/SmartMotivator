ENV['RAILS_ENV'] ||= 'test'

require 'simplecov'
require 'user_follow_helper'
require 'scheduled_job_helper'
require 'mission_helper'
SimpleCov.start 'rails' do
  add_filter do |source_file|
    source_file.lines.count < 5
  end
end

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'capybara/rails'
require 'capybara/minitest'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  # fixtures :all

  # Add more helper methods to be used by all tests here...
end

class ActionDispatch::IntegrationTest
  include Capybara::DSL
  include Capybara::Minitest::Assertions
  include UserFollowHelper
  include ScheduledJobHelper
  include MissionHelper

  def teardown
    Capybara.reset_sessions!
    Capybara.use_default_driver
  end
end

QuizImporter.import_dummy_data
