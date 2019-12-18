# == Schema Information
#
# Table name: prediction_models
#
#  id         :integer          not null, primary key
#  dump_data  :binary           not null
#  trained_at :datetime
#

require 'open3'

class PredictionModel < ApplicationRecord
  RECOMMENDATION_DIRECTORY = "#{Rails.root}/scripts/recommendation"

  def self.first_or_default
    prediction_model = first_or_initialize
    if prediction_model.dump_data.nil?
      prediction_model.reset
      prediction_model.save!
    end
    prediction_model
  end

  def train
    Dir.chdir(RECOMMENDATION_DIRECTORY) do
      begin
        connection = ActiveRecord::Base.connection
        query = "COPY users TO '#{RECOMMENDATION_DIRECTORY}/users.csv' WITH DELIMITER ',' CSV HEADER"
        connection.execute(query)
        query = "COPY (SELECT * FROM user_data WHERE kind IN ('logSetting', 'survey', 'quiz')) TO
          '#{RECOMMENDATION_DIRECTORY}/user_data.csv' WITH DELIMITER ',' CSV HEADER"
        connection.execute(query)

        command = "python3 train.py ./users.csv ./user_data.csv"
        res, err_text, exit_status = Open3.capture3(command, binmode: true)
        if exit_status == 0
          self.dump_data = res
          self.trained_at = Time.now
        else
          raise err_text.force_encoding('UTF-8')
        end
      rescue => e
        Rails.logger.error e
        raise e
      ensure
        FileUtils.rm('users.csv')
        FileUtils.rm('user_data.csv')
      end
    end
  end

  def reset
    model_dump = File.binread("#{RECOMMENDATION_DIRECTORY}/model_default")
    self.dump_data = model_dump
    self.trained_at = nil
  end

  def recommended_setting(survey_values)
    Dir.chdir(RECOMMENDATION_DIRECTORY) do
      command = "python3 recommend.py '#{survey_values}'"
      res_text, err_text, exit_status = Open3.capture3(command, stdin_data: dump_data, binmode: true)
      if exit_status.success?
        if err_text.present?
          Rails.logger.warn(err_text)
        end
        begin
          JSON.parse(res_text)
        rescue => e
          Rails.logger.error(e)
          {}
        end
      else
        Rails.logger.error(res_text) if res_text.present?
        Rails.logger.error(err_text) if err_text.present?
        {}
      end
    end
  end
end
