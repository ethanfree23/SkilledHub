class AddJobPricingFields < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :hourly_rate_cents, :integer
    add_column :jobs, :hours_per_day, :integer, default: 8
    add_column :jobs, :days, :integer
  end
end
