module BulkInserter
  module_function

  def create_missing_study_histories(dates, user = nil)
    db_dates = dates.map { |d| escape_date(d) }
    if user
      list_of_triple = <<-SQL
        SELECT
          '#{user.id}',
          '#{user.course}',
          dates.value
        FROM
          #{to_values(db_dates, 'dates', 'value')}
      SQL
    else
      list_of_triple = <<-SQL
        SELECT
          users.id,
          users.course,
          dates.value
        FROM
          users,
          #{to_values(db_dates, 'dates', 'value')}
        WHERE
          users.ready = 't'
      SQL
    end
    execute <<-SQL
      INSERT INTO study_histories (user_id, course, week_start)
      #{list_of_triple}
      ON CONFLICT DO NOTHING;
    SQL
  end

  def execute(sql)
    pg_result = ApplicationRecord.connection.execute(sql)
    pg_result.cmd_tuples
  end

  def escape_string(str)
    "'#{str.replace("'", "''")}'"
  end

  def escape_date(date)
    raise TypeError unless Date === date
    return "'#{date.iso8601}'::date";
  end

  def to_values(list, collection_name, column_name)
    paren_list = list.map { |v| "(#{v})" }.join(', ')
    return "(VALUES #{paren_list}) AS #{collection_name} (#{column_name})"
  end
end
