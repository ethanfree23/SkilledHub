class AddTimelineToJobs < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :timeline, :text
  end
end
