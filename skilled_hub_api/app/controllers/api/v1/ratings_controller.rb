module Api
  module V1
    class RatingsController < ApplicationController
      before_action :authenticate_user, only: [:index, :show, :create]
      
      def index
        ratings = Rating.all
        ratings = ratings.where(job_id: params[:job_id]) if params[:job_id].present?
        render json: ratings, each_serializer: RatingSerializer, status: :ok
      end
      
      def show
        rating = Rating.find(params[:id])
        render json: rating, serializer: RatingSerializer, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Rating not found" }, status: :not_found
      end

      def create
        job = Job.find(params[:job_id])
        unless job.finished?
          return render json: { error: "Can only review completed jobs" }, status: :unprocessable_entity
        end

        company_profile = job.company_profile
        accepted_app = job.job_applications.find_by(status: :accepted)
        technician_profile = accepted_app&.technician_profile

        unless technician_profile
          return render json: { error: "Job has no claimed technician" }, status: :unprocessable_entity
        end

        reviewer, reviewee = nil, nil
        if @current_user.company? && company_profile.user_id == @current_user.id
          reviewer = company_profile
          reviewee = technician_profile
        elsif @current_user.technician? && technician_profile.user_id == @current_user.id
          reviewer = technician_profile
          reviewee = company_profile
        else
          return render json: { error: "You must be the company or technician for this job to leave a review" }, status: :forbidden
        end

        existing = Rating.find_by(job: job, reviewer: reviewer)
        if existing
          return render json: { error: "You have already reviewed for this job" }, status: :unprocessable_entity
        end

        rating = Rating.new(
          job: job,
          reviewer: reviewer,
          reviewee: reviewee,
          score: params[:score],
          comment: params[:comment]
        )

        if rating.save
          render json: rating, serializer: RatingSerializer, status: :created
        else
          render json: { errors: rating.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Job not found" }, status: :not_found
      end
    end
  end
end 