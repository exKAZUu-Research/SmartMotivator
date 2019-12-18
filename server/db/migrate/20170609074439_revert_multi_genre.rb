require_relative './20170609023312_multi_genre.rb'

class RevertMultiGenre < MultiGenre
  alias_method :parent_up, :up
  alias_method :parent_down, :down

  def up
    parent_down
  end

  def down
    parent_up
  end
end
