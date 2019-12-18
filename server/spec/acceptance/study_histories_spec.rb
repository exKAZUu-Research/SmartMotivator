require_relative '../rails_helper'

resource "学習履歴" do
  before do
    @taro = create_user('Taro')
  end

  get "/study_histories.json" do
    example "学習履歴の取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data.dig('all', 'rate', 'value')).to eq(0)
    end
  end

  post "/study_histories.json" do
    example "目標設定" do
      week_start = Calendar.start_of_week(Date.today)
      data = { week_start.iso8601 => { rate: { goal: 0.8 } } }
      do_request(userId: @taro.id, data: data)
      expect(status).to eq(204)
    end
  end
end
