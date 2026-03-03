class MessageSerializer < ActiveModel::Serializer
  attributes :id, :sender_id, :content, :conversation_id, :created_at, :updated_at
  
  belongs_to :conversation
end 