
class Conversation < ApplicationRecord
  has_many :messages, dependent: :destroy
  belongs_to :job
  belongs_to :technician_profile
  belongs_to :company_profile
  
end
