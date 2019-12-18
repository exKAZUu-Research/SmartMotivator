require_relative '../rails_helper'

resource "フォロー系" do
  before do
    @taro = create_user('Taro')
    @jiro = create_user('Jiro')
  end

  get "/users/:id/search.json" do
    before do
      create_user('Saburo')
      create_user('Shiro')
    end

    let(:id) { @taro.id }

    example "ログインユーザ情報の取得" do
      do_request(query: 'ro')
      expect(status).to eq(200)
      users = JSON.parse(response_body)
      expect(users.size).to eq(3) # 自分は含まない
    end
  end

  get "/users/:id/user_details.json" do
    let(:id) { @taro.id }

    example "他人の情報の取得" do
      do_request(selected_user_id: @jiro.id)
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['id']).to eq(@jiro.id)
    end
  end

  put "/users/:id/toggle_follow.json" do
    let(:id) { @taro.id }

    example "フォローする" do
      do_request(follow_id: @jiro.id)
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['followed']).to eq(true)
    end

    example "フォローを解除する" do
      Follow.create!(follower_id: @taro.id, followee_id: @jiro.id)
      do_request(follow_id: @jiro.id)
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['followed']).to eq(false)
    end
  end

  put "/users/:id/toggle_mute.json" do
    let(:id) { @taro.id }

    example "ミュートする" do
      do_request(mutee_id: @jiro.id)
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['muted']).to eq(true)
    end

    example "ミュートを解除する" do
      Mute.create!(muter_id: @taro.id, mutee_id: @jiro.id)
      do_request(mutee_id: @jiro.id)
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['muted']).to eq(false)
    end
  end
end
