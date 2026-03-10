class AddLocationToTechnicianProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :technician_profiles, :location, :string
  end
end
