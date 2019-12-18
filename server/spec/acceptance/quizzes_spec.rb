require_relative '../rails_helper'

resource "クイズ" do
  before(:all) do
    QuizImporter.import_ngsl
    @genre = Genre.first
    @genre_size = Genre.where(course_key: 'english').count
  end

  before(:each) do
    @taro = create_user('Taro')
  end

  get "new_quizzes/progress.json" do
    example "各クイズの覚えた問題数を取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data.size).to eq(@genre_size)
    end
  end

  delete "new_quizzes/progress.json" do
    example "覚えた問題を全て削除" do
      q = Quiz.first
      Study.create!(
        user_id: @taro.id,
        course: q.course_key,
        quiz_key: q.key,
        available_at: Time.now,
        genre: @genre.key,
      )
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      expect(Study.count).to eq(0)
    end
  end

  get "new_quizzes/courses.json" do
    example "利用可能なコース一覧" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data).to eq([])
    end

    example "利用可能なコース一覧（開発者のみ）" do
      @taro.update_attributes!(role: 'developer')
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      p data
      expect(data.size).to eq(1)
    end
  end

  get "new_quizzes/:course/:genre.json" do
    let(:course) { 'english' }
    let(:genre) { @genre.key }

    example "各クイズの覚えた問題数を取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
    end
  end

  get "new_quizzes/:course/:genre/memorized.json" do
    let(:course) { 'english' }
    let(:genre) { @genre.key }

    example "覚えた問題一覧を取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
    end
  end

  post "new_quizzes/:course/:genre/start.json" do
    let(:course) { 'english' }
    let(:genre) { @genre.key }

    example "今からプレイするクイズのデータを取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data.size).to eq(10)
    end
  end

  post "quizzes/:course/:genre.json" do
    let(:course) { 'english' }
    let(:genre) { @genre.key }

    example "解いた問題を報告" do
      keys = QuizGenre.all.limit(10).pluck_quiz_keys('english', @genre.key)
      answers = keys.map { |k| Hash[quizKey: k, correct: true, spentTime: 1000] }
      do_request(userId: @taro.id, time: Time.now.to_i, answers: answers)
      expect(status).to eq(200)
    end
  end

  post "new_quizzes/start_pretest.json" do
    example "事前テストの問題の取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      data = JSON.parse(response_body)
      expect(data.size).to eq(3)
    end
  end
end
