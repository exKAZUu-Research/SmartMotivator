require_relative '../rails_helper'

resource "行動情報など" do
  before do
    @taro = create_user('Taro')
  end

  post "/user_data.json" do
    example "アプリ起動ログの送信" do
      now = Time.current
      data = [{
        userId: @taro.id,
        kind: 'event',
        value: { data: now, label: nil, action: "launch", category: "app" }.to_json,
        time_msec: now.to_i * 1000,
      }]
      do_request(userId: @taro.id, data: data)
      expect(status).to eq(200)
    end
  end

  get "/user_data/:kind.json" do
    example "ログデータの取得" do
      UserData.create!(
        user_id: @taro.id,
        kind: 'mission',
        time: Time.now,
        value: {
          type: "answer", uuid: "f88b1109-6787-4d39-9952-2d4cd9b493b8",
          bonus: 1.0, earned: 10, reward: 10, isShort: true, goalValue: 10,
          quizCount: nil, threshold: nil, startValue: 0
        }.to_json,
      )
      do_request(userId: @taro.id, kind: 'mission')
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data.size).to eq(1)
    end
  end
end
