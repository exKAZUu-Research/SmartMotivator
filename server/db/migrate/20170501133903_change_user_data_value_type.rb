class ChangeUserDataValueType < ActiveRecord::Migration[5.0]
  def up
    change_column :user_data, :value, :jsonb, using: 'value::jsonb'
    execute <<-SQL.gsub(/\s+/, ' ')
      UPDATE user_data
      SET value = jsonb_build_object(
        'kind',
        'effort',
        'totalPoint',
        value
      )
      WHERE kind = 'point' AND jsonb_typeof(value) = 'number'
    SQL
  end

  def down
    change_column :user_data, :value, :string, using: 'value::text'
  end
end
