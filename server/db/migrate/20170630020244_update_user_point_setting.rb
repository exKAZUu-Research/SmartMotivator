class UpdateUserPointSetting < ActiveRecord::Migration[5.1]
  POINT_TYPE_KEY = 'pointType'
  POINT_TYPE_NONE = 'none'
  POINT_TYPE_EFFORT = 'effort'

  def up
    table_model_each 'users' do |user|
      hash = user.setting
      if hash[POINT_TYPE_KEY] == POINT_TYPE_NONE
        new_setting = hash.merge(POINT_TYPE_KEY => POINT_TYPE_EFFORT)
        user.update_attributes(setting: new_setting)
      end
    end
  end
end
