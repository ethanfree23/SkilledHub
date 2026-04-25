class AddAddressAndSocialToCrmLeads < ActiveRecord::Migration[7.1]
  def change
    change_table :crm_leads, bulk: true do |t|
      t.string :street_address
      t.string :city
      t.string :state
      t.string :zip
      t.string :instagram_url
      t.string :facebook_url
      t.string :linkedin_url
    end
  end
end
