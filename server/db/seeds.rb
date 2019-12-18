# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# User.create_dummies(100, Time.current, course: 'english')

begin
  old_logger = Rails.logger
  Rails.logger = Logger.new(STDOUT)
  QuizImporter.import_all_quizzes
  QuizImporter.delete_old_studies
ensure
  Rails.logger = old_logger
end
