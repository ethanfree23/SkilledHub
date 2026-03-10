class AddStripeIdsToProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :stripe_customer_id, :string
    add_column :technician_profiles, :stripe_account_id, :string
  end
end
