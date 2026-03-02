module Api
  module V1
    class JobSeekersController < ApplicationController
      before_action :authenticate_user
      before_action :require_job_seeker, only: [:show, :update]
      
      def index
        job_seekers = User.where(role: :technician)
        render json: job_seekers, each_serializer: UserSerializer, status: :ok
      end
      
      def show
        job_seeker = User.where(role: :technician).find(params[:id])
        render json: job_seeker, serializer: UserSerializer, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Job seeker not found" }, status: :not_found
      end

      def create
        user = User.new(user_params)
        user.role = :technician
        if user.save
          render json: user, serializer: UserSerializer, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        job_seeker = User.where(role: :technician).find(params[:id])
        if job_seeker.update(user_params)
          render json: job_seeker, serializer: UserSerializer, status: :ok
        else
          render json: { errors: job_seeker.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Job seeker not found" }, status: :not_found
      end

      def destroy
        job_seeker = User.where(role: :technician).find(params[:id])
        job_seeker.destroy
        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Job seeker not found" }, status: :not_found
      end

      private

      def user_params
        params.permit(:email, :password, :password_confirmation)
      end
    end
  end
end 