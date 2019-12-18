task train_prediction_model: :environment do
  ActiveRecord::Base.transaction do
    prediction_model = PredictionModel.first_or_initialize
    prediction_model.train
    prediction_model.save!
  end
end

task reset_prediction_model: :environment do
  prediction_model = PredictionModel.first
  if prediction_model
    prediction_model.reset
    prediction_model.save!
  end
end
