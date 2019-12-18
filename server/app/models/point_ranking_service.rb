module PointRankingService
  module_function

  PointRankingUsers = Struct.new(:top_users, :rival_users, :rival_top_rank, :hidden_rival_count)

  def call(user, point_type, top_size, around_size, min, max)
    column_name = point_type ? "#{point_type}_point" : 'point'
    n_top = top_size # size / 2
    n_around = around_size

    target_scope = User.visible

    case
    when min && max
      target_scope = target_scope.where(column_name => (min...max))
    when min
      target_scope = target_scope.where("#{column_name} >= ?", min)
    when
      target_scope = target_scope.where("#{column_name} < ?", max)
    end

    user_ids = target_scope
      .order("#{column_name} DESC, id <> '#{user.id}' ASC, id ASC") # 同点なら自分を先頭にする
      .pluck(:id)
    my_index = user_ids.index(user.id)
    # 何らかのミスで自分のポイントが範囲に含まれていない場合、自分の周囲は無視してTOPを表示する
    second_index = my_index.nil? ? 0 : [my_index - (n_around - 1) / 2, user_ids.size - n_around].min

    if second_index <= n_top
      # マージ
      top_user_ids = user_ids[0, n_top + n_around]
      top_users = User.find_by_ids(top_user_ids)
      return PointRankingUsers.new(top_users, nil, 1, 0)
    else
      # 別々
      top_users = User.find_by_ids(user_ids[0, n_top])
      rival_users = User.find_by_ids(user_ids[second_index, n_around])

      ranking_top = rival_users[0]
      rival_top_rank = target_scope
        .where(["#{column_name} > :point", point: ranking_top[column_name]])
        .count + 1
      hidden_rival_count = target_scope
        .where(["#{column_name} = :point AND id < :id", id: ranking_top.id, point: ranking_top[column_name]])
        .count

      return PointRankingUsers.new(top_users, rival_users, rival_top_rank, hidden_rival_count)
    end
  end
end
