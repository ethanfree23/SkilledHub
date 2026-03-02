class TechnicianProfile < ApplicationRecord
  belongs_to :user
  has_many :job_applications, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :documents, as: :uploadable, dependent: :destroy
  
end
