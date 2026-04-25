# frozen_string_literal: true

module Api
  module V1
    class MembershipTierConfigsController < ApplicationController
      def index
        audience = params[:audience].to_s
        unless MembershipTierConfig::AUDIENCES.include?(audience)
          return render json: { error: "audience must be technician or company" }, status: :bad_request
        end

        configs = MembershipTierConfig.for_audience(audience)
        render json: { membership_tier_configs: configs.map { |c| serialize(c) } }, status: :ok
      end

      private

      def serialize(config)
        {
          id: config.id,
          audience: config.audience,
          slug: config.slug,
          display_name: config.display_name,
          monthly_fee_cents: config.monthly_fee_cents,
          commission_percent: config.commission_percent.to_f,
          early_access_delay_hours: config.early_access_delay_hours,
          sort_order: config.sort_order
        }
      end
    end
  end
end
