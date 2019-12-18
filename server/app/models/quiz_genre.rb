# == Schema Information
#
# Table name: quiz_genres
#
#  id         :uuid             not null, primary key
#  course_key :string           not null
#  genre_key  :string           not null
#  quiz_key   :string           not null
#
# Indexes
#
#  index_quiz_genres_on_course_key_and_genre_key_and_quiz_key  (course_key,genre_key,quiz_key) UNIQUE
#

class QuizGenre < ApplicationRecord
  belongs_to :course, required: false
  belongs_to :genre, foreign_key: 'genre_key', primary_key: 'key', required: false
  belongs_to :quizs,  required: false

  scope :course_genre, ->(course_key, genre_key) {
    where(course_key: course_key, genre_key: genre_key)
  }

  def self.select_quiz_keys(course_key, genre_key)
    self.course_genre(course_key, genre_key).select(:quiz_key)
  end

  def self.pluck_quiz_keys(course_key, genre_key)
    self.course_genre(course_key, genre_key).pluck(:quiz_key)
  end
end
