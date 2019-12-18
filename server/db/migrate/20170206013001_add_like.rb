class AddLike < ActiveRecord::Migration[5.0]
  def change
    change_id_to_uuid(:messages)

    create_table :likes, id: :uuid do |t|
      t.uuid :message_id, null: false
      t.uuid :user_id, null: false
      t.timestamps
    end
  end

  def change_id_to_uuid(table_name)
    reversible do |dir|
      dir.up do
        change_column_default table_name, :id, nil
        change_column table_name, :id, :uuid, null: false, default: 'uuid_generate_v4()', using: 'uuid_generate_v4()'
        execute "DROP SEQUENCE IF EXISTS #{table_name}_id_seq;"
      end
      dir.down do
        change_column_default table_name, :id, nil
        execute "CREATE SEQUENCE #{table_name}_id_seq;"
        change_column table_name, :id, :integer, null: false,
          using: "nextval('#{table_name}_id_seq'::regclass)"
        execute "ALTER TABLE #{table_name} ALTER COLUMN id SET DEFAULT nextval('#{table_name}_id_seq'::regclass);"
      end
    end
  end
end
