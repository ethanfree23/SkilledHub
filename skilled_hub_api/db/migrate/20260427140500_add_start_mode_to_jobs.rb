class AddStartModeToJobs < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :start_mode, :integer, null: false, default: 0
    add_index :jobs, :start_mode
  end
end
