class ChangeColumnType < ActiveRecord::Migration[5.0]
  def change
    change_column_string_to_uuid(:users, :id, new_default: 'uuid_generate_v4()')
    change_column_string_to_uuid(:user_data, :user_id)
    change_column_string_to_uuid(:study_histories, :user_id)
    change_column_string_to_uuid(:messages, :user_id)

    change_column_string_to_jsonb(:users, :setting, old_default: '{}', new_default: {})
  end

  def change_column_string_to_jsonb(table, column, old_default: nil, new_default: nil)
    reversible do |dir|
      dir.up do
        change_column_default table, column, nil if old_default
        change_column         table, column, :jsonb, using: "cast(#{column} as json)"
        change_column_default table, column, new_default if new_default
      end
      dir.down do
        change_column_default table, column, nil if new_default
        change_column         table, column, :string
        change_column_default table, column, old_default if old_default
      end
    end
  end

  def change_column_string_to_uuid(table, column, old_default: nil, new_default: nil)
    reversible do |dir|
      dir.up do
        change_column_default table, column, nil if old_default
        change_column         table, column, :uuid, using: "#{column}::uuid"
        change_column_default table, column, new_default if new_default
      end
      dir.down do
        change_column_default table, column, nil if new_default
        change_column         table, column, :string
        change_column_default table, column, old_default if old_default
      end
    end
  end
end
