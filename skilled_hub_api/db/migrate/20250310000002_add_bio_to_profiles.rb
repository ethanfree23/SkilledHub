class AddBioToProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :company_profiles, :bio, :text
    add_column :technician_profiles, :bio, :text
  end
end
