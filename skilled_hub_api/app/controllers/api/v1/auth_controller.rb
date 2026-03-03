module Api
  module V1
    class AuthController < ApplicationController
      before_action :authenticate_user, only: [:index]
      
      def index
        render json: { 
          authenticated: true, 
          user_id: @current_user.id,
          message: "User is authenticated" 
        }, status: :ok
      end
    end
  end
end 