class CreateSchools < ActiveRecord::Migration[5.0]
  def change
    create_table :schools, id: :uuid do |t|
      t.string :name, null: false
      t.string :prefix, null: false
      t.string :course, null: false, default: ''
      t.string :read_password, null: false, default: ''
      t.string :write_password, null: false, default: ''
      t.timestamps
    end

    create_table :teachers, id: :uuid do |t|
      t.string :name, null: false
      t.uuid :school_id, null: false
      t.timestamps
    end

    add_column :users, :school_id, :uuid
    add_column :users, :teacher_id, :uuid
    add_column :users, :login_id, :string
    add_column :users, :password, :string
    add_index :users, :login_id, unique: true

    reversible do |dir|
      dir.up do
        change_column :users, :last_access, :datetime, null: true, default: nil
      end
      dir.down do
        change_column :users, :last_access, :datetime, null: false, default: Time.zone.at(0)
      end
    end
  end
end
