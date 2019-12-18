class AddCourseToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :course, :string, null: false, default: ''
    add_column :study_histories, :course, :string, null: false, default: ''

    old_course = 'english'
    reversible do |dir|
      dir.up do
        table_model('users') do |klass|
          klass.update_all(course: old_course)
        end
        table_model('study_histories') do |klass|
          klass.update_all(course: old_course)
        end
        remove_index :study_histories, [:user_id, :week_start]
        add_index :study_histories, [:course, :user_id, :week_start], unique: true
        change_column_default :study_histories, :course, nil
      end
      dir.down do
        remove_index :study_histories, [:course, :user_id, :week_start]
        add_index :study_histories, [:user_id, :week_start], unique: true
      end
    end
  end
end
