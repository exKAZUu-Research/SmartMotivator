module VersionChecker
  module_function

  def pass?(client_version)
    req_version = Settings.minimum_required_client_version
    version = nil
    if client_version
      if version = client_version[/[0-9]+\.[0-9]+\.[0-9]+/]
        if Gem::Version.new(req_version) <= Gem::Version.new(version)
          return true
        end
      end
    end
    Rails.logger.info "Client version mismatch. " +
      "client: #{version}, server requested: #{req_version} or newer"
    false
  end
end
