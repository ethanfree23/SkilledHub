class TechnicianProfile < ApplicationRecord
  belongs_to :user
  has_many :job_applications, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :documents, as: :uploadable, dependent: :destroy
  has_many :ratings_received, -> { order(created_at: :desc) }, class_name: 'Rating', as: :reviewee, dependent: :destroy

  def average_rating
    Rating.average_for(self)
  end
end
