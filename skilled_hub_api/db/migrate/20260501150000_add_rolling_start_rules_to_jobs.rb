class AddRollingStartRulesToJobs < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :rolling_start_rule_type, :integer, null: false, default: 0
    add_column :jobs, :rolling_start_exact_start_at, :datetime
    add_column :jobs, :rolling_start_days_after_acceptance, :integer
    add_column :jobs, :rolling_start_weekday, :integer
    add_column :jobs, :rolling_start_weekday_time, :string

    add_index :jobs, :rolling_start_rule_type
  end
end
