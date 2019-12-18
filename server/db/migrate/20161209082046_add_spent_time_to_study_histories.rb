class AddSpentTimeToStudyHistories < ActiveRecord::Migration[5.0]
  def change
    [
      ['%s_goal', :integer, {}],
      ['total_%s', :integer, null: false, default: 0],
      ['cache_%s_score', :float, null: false, default: 0.0],
      ['cahce_%s_rank', :integer, null: false, default: 0],
    ].each do |column, type, option|
      add_column :study_histories, column % 'spent_time', type, option.merge(after: column % 'count')
    end
  end
end
