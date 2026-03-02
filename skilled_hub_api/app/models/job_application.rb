
class JobApplication < ApplicationRecord
  enum status: { requested: 0, accepted: 1, rejected: 2 }

  belongs_to :job
  belongs_to :technician_profile
end
