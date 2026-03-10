class AddCoordinatesToJobsAndTechnicianProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :latitude, :decimal, precision: 10, scale: 7
    add_column :jobs, :longitude, :decimal, precision: 10, scale: 7
    add_column :technician_profiles, :latitude, :decimal, precision: 10, scale: 7
    add_column :technician_profiles, :longitude, :decimal, precision: 10, scale: 7
  end
end
