class Job < ApplicationRecord
  enum status: { open: 0, reserved: 1, accepted: 2, completed: 3, filled: 4, finished: 5 }
  
  belongs_to :company_profile

  has_many :job_applications, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :ratings, dependent: :destroy
  
end
