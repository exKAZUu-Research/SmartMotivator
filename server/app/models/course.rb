# == Schema Information
#
# Table name: courses
#
#  id       :uuid             not null, primary key
#  key      :string           not null
#  label    :string           not null
#  editable :boolean          default(FALSE), not null
#
# Indexes
#
#  index_courses_on_key  (key) UNIQUE
#

class Course < ApplicationRecord
  %i(genres quizzes quiz_genres).each do |models|
    has_many models,
      primary_key: :key,
      foreign_key: :course_key,
      dependent: :delete_all,
      validate: false
  end
end
