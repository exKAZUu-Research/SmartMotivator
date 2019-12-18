module Admin
  class BaseController < ApplicationController
    layout 'admin_layout'
    helper AdminHelper
    before_action :basic unless Rails.env.test?

    def render_error(text)
      render plain: text
    end

    def basic
      authenticate_or_request_with_http_basic do |user, pass|
        auth_info = self.class.auth_info
        user == auth_info['user'] && pass == auth_info['pass']
      end
    end

    class << self
      def auth_info
        @auth_info ||= read_auth_info
      end

      def read_auth_info
        YAML.load(File.read(Rails.root + 'config/basic_auth.yml'))['admin']
      end
    end
  end
end
