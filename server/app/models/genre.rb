# == Schema Information
#
# Table name: genres
#
#  id         :uuid             not null, primary key
#  key        :string           not null
#  course_key :string           not null
#  label      :string           not null
#  ordering   :integer          default(0), not null
#  quiz_size  :integer          default(0), not null
#
# Indexes
#
#  index_genres_on_course_key_and_key  (course_key,key) UNIQUE
#

class Genre < ApplicationRecord
  Stats = Struct.new(:course, :genre, :label, :memorized, :correct, :answered, :total)

  def self.stats(user)
    scope = where(course_key: user.course)
    stats = scope.order(:ordering).map do |g|
      Stats.new(g.course_key, g.key, g.label, 0, 0, 0, 0)
    end
    map = stats.each_with_object({}) { |s, obj| obj[s.genre] = s }
    genre_list = scope.select(:key)

    records = Study
      .where(user_id: user.id, course: user.course, genre: genre_list)
      .group(:genre)
      .select('genre, count(*) as count')
    records.memorized.each do |x|
      map[x.genre].memorized = x.count
    end
    records.correct_some.each do |x|
      map[x.genre].correct = x.count
    end
    records.each do |x|
      map[x.genre].answered = x.count
    end

    records = QuizGenre
      .where(course_key: user.course, genre_key: genre_list)
      .group(:genre_key)
      .select('genre_key, count(*) as count')
    records.each do |g|
      map[g.genre_key].total = g.count
    end

    return stats
  end

  def self.labels(course_key, genre_key, quiz_keys)
    out_quiz_key = QuizGenre
      .joins(:genre)
      .where(course_key: course_key, quiz_key: quiz_keys)
      .where.not(genre_key: genre_key)
      .pluck(:quiz_key, :label)
      .to_h
  end
end
