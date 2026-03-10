class AddAddressFieldsToJobs < ActiveRecord::Migration[7.1]
  def change
    add_column :jobs, :address, :string
    add_column :jobs, :city, :string
    add_column :jobs, :state, :string
    add_column :jobs, :zip_code, :string
    add_column :jobs, :country, :string
  end
end
