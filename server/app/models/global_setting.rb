# == Schema Information
#
# Table name: global_settings
#
#  key   :string           not null, primary key
#  value :string           not null
#
# Indexes
#
#  index_global_settings_on_key  (key) UNIQUE
#

class GlobalSetting < ApplicationRecord
  self.primary_key = :key

  EXPERIMENT_START_DAY = 'EXPERIMENT_START_DAY'
  EXPERIMENT_END_DAY = 'EXPERIMENT_END_DAY'
  DEV_DAILY_JOB_EXECUTED_AT = 'DEV_DAILY_JOB_EXECUTED_AT'
  DEV_WEEKLY_JOB_EXECUTED_AT = 'DEV_WEEKLY_JOB_EXECUTED_AT'

  KEYS = [
    EXPERIMENT_START_DAY,
    EXPERIMENT_END_DAY,
    DEV_DAILY_JOB_EXECUTED_AT,
    DEV_WEEKLY_JOB_EXECUTED_AT,
  ]

  class << self
    def all_settings
      dic = all.each_with_object({}) { |record, hash| hash[record.key] = record.value }
      KEYS.map { |k| [k, dic[k]] }
    end

    def update_key_value(key, value)
      find_or_initialize_by(key: key).tap do |x|
        x.value = value
        x.save!
      end
    end

    def experiment_start_day
      read_date EXPERIMENT_START_DAY
    end

    def experiment_end_day
      read_date EXPERIMENT_END_DAY
    end

    def daily_job_executed_at
      read_date DEV_DAILY_JOB_EXECUTED_AT
    end

    def daily_job_executed_at=(date)
      write_date DEV_DAILY_JOB_EXECUTED_AT, date
    end

    def weekly_job_executed_at
      read_date DEV_WEEKLY_JOB_EXECUTED_AT
    end

    def weekly_job_executed_at=(date)
      write_date DEV_WEEKLY_JOB_EXECUTED_AT, date
    end

    private

    def read_date(key)
      record = find_by_key(key)
      record ? Date.parse(record.value) : nil
    end

    def write_date(key, date)
      update_key_value(key, date.iso8601)
    end
  end
end
