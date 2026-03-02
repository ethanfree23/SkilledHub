class CompanyProfile < ApplicationRecord
  belongs_to :user
  has_many :jobs, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :documents, as: :uploadable, dependent: :destroy
  
end
