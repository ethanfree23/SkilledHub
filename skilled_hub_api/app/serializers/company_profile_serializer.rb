class CompanyProfileSerializer < ActiveModel::Serializer
  attributes :id, :company_name, :industry, :location, :bio, :avatar_url, :user_id, :average_rating, :created_at, :updated_at

  belongs_to :user
  has_many :jobs

  def avatar_url
    return nil unless object.avatar.attached?
    Rails.application.routes.url_helpers.rails_blob_url(object.avatar)
  rescue StandardError
    nil
  end
end 