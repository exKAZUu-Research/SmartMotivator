class CreatePredictionModels < ActiveRecord::Migration[5.1]
  def change
    create_table :prediction_models do |t|
      t.binary :dump_data, null: false
    end
  end
end
