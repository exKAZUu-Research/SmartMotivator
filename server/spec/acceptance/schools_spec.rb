require_relative '../rails_helper'

resource "学校" do
  before do
    contact_text = <<~TEXT
      お問い合わせはこちらまで
      user@example.com
    TEXT
    @school = School.create!(
      course: 'english',
      prefix: '',
      internal_name: 'なんちゃら校',
      contact_text: contact_text)
    @taro = create_user('Taro', school_id: @school.id)
  end

  get "/schools/:id.json" do
    let(:id) { @school.id }

    example "学校情報の取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      school = JSON.parse(response_body)
      expect(school['contactText']).to match(/example.com/)
    end
  end
end
