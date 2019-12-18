# == Schema Information
#
# Table name: genre_completions
#
#  id         :integer          not null, primary key
#  user_id    :uuid             not null
#  course     :string           not null
#  genre      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class GenreCompletion < ApplicationRecord
  belongs_to :user
end
