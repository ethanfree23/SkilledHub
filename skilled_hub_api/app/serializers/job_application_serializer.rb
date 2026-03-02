class JobApplicationSerializer < ActiveModel::Serializer
  attributes :id, :status, :job_id, :technician_profile_id, :created_at, :updated_at
  
  belongs_to :job
  belongs_to :technician_profile
end 