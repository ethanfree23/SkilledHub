class AddAddressFieldsToTechnicianProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :technician_profiles, :address, :string
    add_column :technician_profiles, :city, :string
    add_column :technician_profiles, :state, :string
    add_column :technician_profiles, :zip_code, :string
    add_column :technician_profiles, :country, :string
  end
end
