class CreateStudySummaries < ActiveRecord::Migration[5.0]
  def change
    create_view :study_summaries
  end
end
