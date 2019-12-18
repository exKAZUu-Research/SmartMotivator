class ConvertItQuizGenre < ActiveRecord::Migration[5.0]
  COURSE_IT = 'informatics'

  def up
    [
      { genre: 'it_25_spring', prefix: '25-spring' },
      { genre: 'it_25_autumn', prefix: '25-autumn' },
      { genre: 'it_26_spring', prefix: '26-spring' },
      { genre: 'it_26_autumn', prefix: '26-autumn' },
      { genre: 'it_27_spring', prefix: '27-spring' },
      { genre: 'it_27_autumn', prefix: '27-autumn' },
    ].each do | genre:, prefix: |
      execute <<-SQL.gsub(/\s+/, ' ').strip
        UPDATE studies SET genre = '#{genre}'
          WHERE course = '#{COURSE_IT}' AND quiz_key LIKE '#{prefix}' || '%'
      SQL
    end
  end

  def down
    execute "UPDATE studies SET genre = 'default' WHERE course = '#{COURSE_IT}'"
  end
end
