class AddTrainedAtToPredictionModels < ActiveRecord::Migration[5.1]
  def change
    add_column :prediction_models, :trained_at, :datetime
  end
end
