class CreateTechnicianProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :technician_profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.string :trade_type
      t.integer :experience_years
      t.string :availability

      t.timestamps
    end
  end
end
