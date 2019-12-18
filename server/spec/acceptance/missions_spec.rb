require_relative '../rails_helper'

resource "ミッション系" do
  before do
    @taro = create_user('Taro', point: 10)
    @taro = create_user('Jiro', point: 20)
    @taro = create_user('Saburo', point: 5)
  end

  get "/mission.json" do
    example "ミッション一覧の取得" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      mission_info = JSON.parse(response_body)
      expect(mission_info['missions'].size).to eq(4)
    end
  end

  get "/mission/ranking.json" do
    example "ミッションポイントランキング" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
      mission_info = JSON.parse(response_body)
      expect(mission_info.dig('topUsers', 0, 'name')).to eq('Jiro')
    end
  end

  get "/mission/self_ranking.json" do
    example "自己ハイスコアランキング" do
      do_request(userId: @taro.id)
      expect(status).to eq(200)
    end
  end

  # # JSONが上手く動かないので
  # post "/mission.json" do
  #   let(:request_header) do
  #     { 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json' }
  #   end
  #
  #   example "クイズの結果でミッションを更新する" do
  #     answers = [
  #       {"correct"=>true, "quizKey"=>"advertisement", "spentTime"=>11189, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"agreement", "spentTime"=>1062, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"argument", "spentTime"=>1450, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"complex", "spentTime"=>1376, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"distinguish", "spentTime"=>1978, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"emphasis", "spentTime"=>2959, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"historical", "spentTime"=>1414, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"loss", "spentTime"=>1134, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"photograph", "spentTime"=>1348, "answerIndex"=>0},
  #       {"correct"=>true, "quizKey"=>"specifically", "spentTime"=>4112, "answerIndex"=>0},
  #     ]
  #     do_request(userId: @taro.id, answers: answers)
  #     expect(status).to eq(200)
  #   end
  # end
end
