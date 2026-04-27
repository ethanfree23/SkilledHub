class CreateJobCounterOffers < ActiveRecord::Migration[7.1]
  def change
    create_table :job_counter_offers do |t|
      t.references :job, null: false, foreign_key: true
      t.references :technician_profile, null: false, foreign_key: true
      t.references :company_profile, null: false, foreign_key: true
      t.references :parent_offer, foreign_key: { to_table: :job_counter_offers }
      t.integer :status, null: false, default: 0
      t.integer :created_by_role, null: false
      t.integer :proposed_hourly_rate_cents
      t.integer :proposed_hours_per_day
      t.integer :proposed_days
      t.datetime :proposed_start_at
      t.datetime :proposed_end_at
      t.integer :proposed_start_mode, null: false, default: 0
      t.datetime :responded_at
      t.timestamps
    end

    add_index :job_counter_offers, :status
    add_index :job_counter_offers, [:job_id, :created_at]
  end
end
