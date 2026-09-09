# frozen_string_literal: true

module Api
  module V1
    class PasswordSetupController < ApplicationController
      def start
        result = PasswordSetup::Start.call(email: params[:email], ip: request.remote_ip)
        render json: result.body, status: result.http_status
      end

      def verify
        result = PasswordSetup::Verify.call(
          challenge_id: params[:challenge_id],
          code: params[:code],
          ip: request.remote_ip
        )
        render json: result.body, status: result.http_status
      end

      def complete
        result = PasswordSetup::Complete.call(
          challenge_id: params[:challenge_id],
          verification_token: params[:verification_token],
          password: params[:password],
          password_confirmation: params[:password_confirmation]
        )
        render json: result.body, status: result.http_status
      end
    end
  end
end
