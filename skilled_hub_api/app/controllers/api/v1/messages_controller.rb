module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_user, only: [:index, :show]
      
      def index
        messages = Message.all
        render json: messages, each_serializer: MessageSerializer, status: :ok
      end
      
      def show
        message = Message.find(params[:id])
        render json: message, serializer: MessageSerializer, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Message not found" }, status: :not_found
      end
    end
  end
end 