class CreateWeeklyPoints < ActiveRecord::Migration[5.0]
  def change
    create_table :weekly_points do |t|
      t.uuid :user_id, null: false
      t.date :week_start, null: false
      t.integer :effort_point, null: false, default: 0
      t.integer :study_point, null: false, default: 0
    end
    add_index :weekly_points, %i(user_id week_start), unique: true

    rename_column :users, :point, :effort_point
    add_column :users, :study_point, :integer, null: false, default: 0

    # old_kind = 'point'
    # new_kind = 'effortPoint'
    # reversible do |dir|
    #   dir.up do
    #     execute "UPDATE user_data SET kind ='#{new_kind}' WHERE kind = '#{old_kind}'"
    #   end
    #   dir.down do
    #     execute "UPDATE user_data SET kind ='#{old_kind}' WHERE kind = '#{new_kind}'"
    #   end
    # end
  end
end
