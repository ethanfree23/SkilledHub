class TechnicianProfileSerializer < ActiveModel::Serializer
  attributes :id, :trade_type, :experience_years, :user_id, :average_rating, :created_at, :updated_at

  belongs_to :user
  has_many :documents
  has_many :job_applications
end 