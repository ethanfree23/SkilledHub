# frozen_string_literal: true

module Api
  module V1
    module Admin
      class EmailQaController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        def templates
          render json: { templates: EmailQaRunner.templates }, status: :ok
        end

        def preview
          runner = EmailQaRunner.new(admin_user: current_user, to_email: params[:to_email])
          payload = runner.preview(params[:template_key])
          render json: payload, status: :ok
        rescue ArgumentError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def send_one
          runner = EmailQaRunner.new(admin_user: current_user, to_email: params[:to_email])
          payload = runner.send_one(
            template_key: params[:template_key],
            confirmation: params[:confirmation]
          )
          render json: payload, status: :ok
        rescue ArgumentError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def send_all
          runner = EmailQaRunner.new(admin_user: current_user, to_email: params[:to_email])
          results = runner.send_all(confirmation: params[:confirmation])
          render json: { results: results }, status: :ok
        rescue ArgumentError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
