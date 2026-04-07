# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PlatformInsightsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        # GET /api/v1/admin/platform_insights?category=companies&period=7d
        def show
          result = AdminPlatformInsights.call(category: params[:category].to_s, period: params[:period].to_s)
          if result[:error]
            render json: result, status: :unprocessable_entity
          else
            render json: result, status: :ok
          end
        end
      end
    end
  end
end
