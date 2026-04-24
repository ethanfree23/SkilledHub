# frozen_string_literal: true

class CompanyProfileContactAndSocial < ActiveRecord::Migration[7.1]
  def change
    add_column :company_profiles, :phone, :string
    add_column :company_profiles, :website_url, :string
    add_column :company_profiles, :facebook_url, :string
    add_column :company_profiles, :instagram_url, :string
    add_column :company_profiles, :linkedin_url, :string
    add_column :company_profiles, :service_cities, :json, default: []
  end
end
