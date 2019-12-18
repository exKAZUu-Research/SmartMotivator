require_relative '../rails_helper'

resource "ログイン処理など" do
  post "/users.json" do
    parameter :user, 'ユーザ情報'

    example "アカウントを登録" do
      do_request(user: { name: 'Taro', course: 'english' })
      expect(status).to eq(200)
    end
  end

  get "/users/:id.json" do
    before do
      @user = create_user('Jiro')
    end
    let(:id) { @user.id }

    example "ログインユーザ情報の取得" do
      do_request
      expect(status).to eq(200)
      user = JSON.parse(response_body)
      expect(user['name']).to eq('Jiro')
    end
  end

  put "/users/:id.json" do
    parameter :user, '更新したいユーザ情報'

    before do
      @user = create_user('Jiro')
    end
    let(:id) { @user.id }

    example "ニックネームの変更" do
      do_request(user: { name: 'Saburo' })
      expect(status).to eq(200)
      name = JSON.parse(response_body)['name']
      expect(name).to eq('Saburo')
    end
  end

  get "/users/:id/recommended_setting.json" do
    before do
      @user = create_user('Jiro', ready: false)
    end
    let(:id) { @user.id }

    example "オススメの設定を取得" do
      do_request
      expect(status).to eq(200)
    end
  end
end
