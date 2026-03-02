class CompanyProfileSerializer < ActiveModel::Serializer
  attributes :id, :company_name, :location, :user_id, :created_at, :updated_at
  
  belongs_to :user
  has_many :jobs
end 