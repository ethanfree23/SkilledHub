module Api
  module V1
    class ConversationsController < ApplicationController
      before_action :authenticate_user, only: [:index, :show]
      
      def index
        conversations = Conversation.all
        render json: conversations, each_serializer: ConversationSerializer, status: :ok
      end
      
      def show
        conversation = Conversation.find(params[:id])
        render json: conversation, serializer: ConversationSerializer, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Conversation not found" }, status: :not_found
      end
    end
  end
end 