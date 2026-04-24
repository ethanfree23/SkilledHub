# frozen_string_literal: true

module Api
  module V1
    module Admin
      class LocationSuggestionsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        # GET /api/v1/admin/location_suggestions?q=aust
        def index
          q = params[:q].to_s.strip
          if q.length < 2
            return render json: { suggestions: [] }, status: :ok
          end

          suggestions = GeocodingService.city_suggestions(q)
          render json: { suggestions: suggestions }, status: :ok
        end
      end
    end
  end
end
