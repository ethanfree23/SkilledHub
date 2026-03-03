class ConversationSerializer < ActiveModel::Serializer
  attributes :id, :job_id, :created_at, :updated_at
  
  belongs_to :job
  has_many :messages
end 