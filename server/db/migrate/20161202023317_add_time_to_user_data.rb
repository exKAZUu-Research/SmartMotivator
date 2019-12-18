class AddTimeToUserData < ActiveRecord::Migration[5.0]
  def up
    add_column :user_data, :time, :datetime
    table_model 'user_data', skip_timestamp: true do |model|
      model.transaction do
        model.find_each do |u|
          u.time = u.created_at
          u.save!
        end
      end
    end
    change_column_null :user_data, :time, false
  end

  def down
    remove_column :user_data, :time
  end
end
