class CompanyProfileDetailSerializer < ActiveModel::Serializer
  attributes :id, :company_name, :industry, :location, :user_id, :average_rating, :created_at, :updated_at

  belongs_to :user
  has_many :ratings_received, serializer: RatingSerializer
end
