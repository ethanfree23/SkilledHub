# frozen_string_literal: true

module Api
  module V1
    class SavedJobSearchesController < ApplicationController
      before_action :authenticate_user
      before_action :require_technician
      before_action :set_technician_profile

      def index
        searches = @technician_profile.saved_job_searches.order(updated_at: :desc)
        render json: serialize_searches(searches), status: :ok
      end

      def create
        attrs = search_key_params
        search = @technician_profile.saved_job_searches.find_by(
          keyword: attrs[:keyword],
          location: attrs[:location],
          skill_class: attrs[:skill_class],
          max_distance_miles: attrs[:max_distance_miles],
          min_hourly_rate_cents: attrs[:min_hourly_rate_cents],
          max_required_years_experience: attrs[:max_required_years_experience],
          required_certifications: attrs[:required_certifications]
        )
        if search
          search.touch
        else
          search = @technician_profile.saved_job_searches.create!(attrs)
        end
        render json: serialize_search(search), status: :created
      rescue ActiveRecord::RecordNotUnique
        search = @technician_profile.saved_job_searches.find_by!(
          keyword: attrs[:keyword],
          location: attrs[:location],
          skill_class: attrs[:skill_class],
          max_distance_miles: attrs[:max_distance_miles],
          min_hourly_rate_cents: attrs[:min_hourly_rate_cents],
          max_required_years_experience: attrs[:max_required_years_experience],
          required_certifications: attrs[:required_certifications]
        )
        search.touch
        render json: serialize_search(search), status: :created
      end

      def destroy
        search = @technician_profile.saved_job_searches.find(params[:id])
        search.destroy!
        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Saved search not found' }, status: :not_found
      end

      private

      def set_technician_profile
        @technician_profile = @current_user.technician_profile
        return if @technician_profile

        render json: { error: 'Technician profile required' }, status: :unprocessable_entity
      end

      def search_key_params
        {
          keyword: params[:keyword].to_s.strip.presence,
          location: params[:location].to_s.strip.presence,
          skill_class: params[:skill_class].to_s.strip.presence,
          max_distance_miles: int_or_nil(params[:max_distance_miles]),
          min_hourly_rate_cents: int_or_nil(params[:min_hourly_rate_cents]),
          max_required_years_experience: int_or_nil(params[:max_required_years_experience]),
          required_certifications: normalize_required_certifications(params[:required_certifications])
        }
      end

      def int_or_nil(value)
        str = value.to_s.strip
        return nil if str.blank?

        str.to_i
      end

      def normalize_required_certifications(raw)
        values =
          if raw.is_a?(Array)
            raw
          else
            raw.to_s.split(",")
          end
        normalized = values.map { |item| item.to_s.strip.downcase }.reject(&:blank?).uniq.sort
        normalized.present? ? normalized.to_json : nil
      end

      def serialize_searches(searches)
        searches.map { |search| serialize_search(search) }
      end

      def serialize_search(search)
        search.as_json(
          only: %i[
            id
            keyword
            location
            skill_class
            max_distance_miles
            min_hourly_rate_cents
            max_required_years_experience
            created_at
            updated_at
          ]
        ).merge("required_certifications" => search.required_certifications_array)
      end
    end
  end
end
