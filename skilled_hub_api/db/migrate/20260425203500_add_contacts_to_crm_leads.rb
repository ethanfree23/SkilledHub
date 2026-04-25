class AddContactsToCrmLeads < ActiveRecord::Migration[7.1]
  def change
    add_column :crm_leads, :contacts, :json, null: false, default: []
  end
end
