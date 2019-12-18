class MigrateUserSetting < ActiveRecord::Migration[5.0]
  class User < ActiveRecord::Base; end

  def change
    User.find_each do |user|
      setting = user.setting.clone
      enabled = setting.delete('enablePoint')
      new_value = enabled ? 'effort' : 'none'
      setting.merge!('pointType' => new_value)
      user.setting = setting
      user.save
    end
  end
end
