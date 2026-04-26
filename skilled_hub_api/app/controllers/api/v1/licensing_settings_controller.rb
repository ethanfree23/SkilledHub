# frozen_string_literal: true

module Api
  module V1
    class LicensingSettingsController < ApplicationController
      def show
        render json: {
          local_only_state_codes: PlatformSetting.local_only_license_state_codes,
          default_requires_statewide_license: true
        }, status: :ok
      end
    end
  end
end
