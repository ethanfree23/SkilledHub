class AddStateAndElectricalLicenseToCompanyProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :company_profiles, :state, :string
    add_column :company_profiles, :electrical_license_number, :string
    add_index :company_profiles, :state
  end
end
