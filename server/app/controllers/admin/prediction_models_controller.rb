class Admin::PredictionModelsController < Admin::BaseController
  def show
    @prediction_model = PredictionModel.first_or_default
  end

  def create
    begin
      ActiveRecord::Base.transaction do
        prediction_model = PredictionModel.first_or_initialize
        prediction_model.train
        prediction_model.save!
      end
    rescue Exception => e
      flash[:error] = e.message
    end

    redirect_to admin_prediction_models_path
  end

  def reset
    prediction_model = PredictionModel.first
    if prediction_model
      prediction_model.reset
      prediction_model.save!
    end

    redirect_to admin_prediction_models_path
  end

  def check_availability
    survey_values = JSON.generate([1] * 99)
    recommendation = PredictionModel.first_or_default.recommended_setting(survey_values)
    available = !recommendation.empty?
    render json: available
  end
end
