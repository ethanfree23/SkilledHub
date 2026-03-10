class TechnicianProfileSerializer < ActiveModel::Serializer
  attributes :id, :trade_type, :experience_years, :availability, :bio, :location, :avatar_url, :stripe_connected, :user_id, :average_rating, :created_at, :updated_at,
             :address, :city, :state, :zip_code, :country, :latitude, :longitude

  belongs_to :user
  has_many :documents
  has_many :job_applications

  def avatar_url
    return nil unless object.avatar.attached?
    Rails.application.routes.url_helpers.rails_blob_url(object.avatar)
  rescue StandardError
    nil
  end

  def stripe_connected
    object.stripe_account_id.present?
  end
end 