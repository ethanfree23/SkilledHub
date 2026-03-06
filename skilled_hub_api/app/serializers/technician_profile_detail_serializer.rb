class TechnicianProfileDetailSerializer < ActiveModel::Serializer
  attributes :id, :trade_type, :experience_years, :user_id, :average_rating, :created_at, :updated_at

  belongs_to :user
  has_many :ratings_received, serializer: RatingSerializer
end
