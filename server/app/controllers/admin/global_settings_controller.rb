class Admin::GlobalSettingsController < Admin::BaseController
  def show
    @settings = GlobalSetting.all_settings
  end

  def create(key, value)
    if GlobalSetting::KEYS.include? key
      GlobalSetting.update_key_value(key, value)
    end
    redirect_to admin_global_settings_path
  end
end
