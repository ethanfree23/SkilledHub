# frozen_string_literal: true

module Api
  module V1
    module Admin
      class LicensingSettingsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        def show
          render json: {
            local_only_state_codes: PlatformSetting.local_only_license_state_codes,
            default_requires_statewide_license: true
          }, status: :ok
        end

        def update
          updated = PlatformSetting.set_local_only_license_state_codes!(params[:local_only_state_codes])
          render json: {
            local_only_state_codes: updated,
            default_requires_statewide_license: true
          }, status: :ok
        end
      end
    end
  end
end
