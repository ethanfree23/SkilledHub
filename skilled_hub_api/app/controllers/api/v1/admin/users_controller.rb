# frozen_string_literal: true

module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        # GET /api/v1/admin/users?q=&role=
        # role: all | technician | company (default all)
        def index
          scope = User.where(role: %i[technician company]).includes(:technician_profile, :company_profile).order(:email)
          scope = filter_by_role(scope)
          scope = filter_by_search(scope)

          users = scope.map { |u| list_item(u) }
          render json: { users: users }, status: :ok
        end

        # GET /api/v1/admin/users/:id?period=7d
        def show
          result = AdminUserDetail.call(user_id: params[:id].to_i, period: params[:period])
          if result[:error]
            status = result[:error] == "User not found" ? :not_found : :unprocessable_entity
            render json: { error: result[:error] }, status: status
          else
            render json: result, status: :ok
          end
        end

        # POST /api/v1/admin/users — JSON or multipart (company + logo)
        def create
          role = params[:role].to_s
          begin
            case role
            when "company"
              result = AdminAccountProvisioner.provision_company!(
                email: params[:email],
                company_name: params[:company_name],
                industry: params[:industry],
                bio: params[:bio],
                phone: params[:phone],
                website_url: params[:website_url],
                facebook_url: params[:facebook_url],
                instagram_url: params[:instagram_url],
                linkedin_url: params[:linkedin_url],
                service_cities: parse_service_cities_param,
                logo: params[:logo],
                contact_name: params[:contact_name]
              )
            when "technician"
              result = AdminAccountProvisioner.provision_technician!(
                email: params[:email],
                trade_type: params[:trade_type],
                location: params[:location],
                experience_years: params[:experience_years],
                availability: params[:availability],
                bio: params[:bio]
              )
            else
              return render json: { errors: ["role must be company or technician"] }, status: :unprocessable_entity
            end
          rescue AdminAccountProvisioner::Error => e
            return render json: { errors: [e.message] }, status: :unprocessable_entity
          end

          user = result[:user]
          profile = result[:profile]
          payload =
            if role == "company"
              {
                user: UserSerializer.new(user).as_json,
                company_profile: profile.as_json(
                  only: %i[
                    id company_name industry location bio phone website_url facebook_url instagram_url linkedin_url
                    service_cities user_id created_at updated_at
                  ]
                ).merge("avatar_url" => company_avatar_url(profile))
              }
            else
              {
                user: UserSerializer.new(user).as_json,
                technician_profile: profile.as_json(
                  only: %i[id trade_type location experience_years availability bio user_id created_at updated_at]
                )
              }
            end

          render json: payload, status: :created
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        private

        def company_avatar_url(profile)
          return nil unless profile.avatar.attached?

          Rails.application.routes.url_helpers.rails_blob_url(profile.avatar)
        rescue StandardError
          nil
        end

        def parse_service_cities_param
          raw = params[:service_cities]
          return [] if raw.blank?

          if raw.is_a?(Array)
            return raw.map(&:to_s).map(&:strip).reject(&:blank?).uniq
          end

          if raw.is_a?(ActionController::Parameters)
            return raw.to_unsafe_h.sort_by { |k, _| k.to_s.to_i }.map { |_, v| v.to_s.strip }.reject(&:blank?).uniq
          end

          if raw.is_a?(String)
            begin
              parsed = JSON.parse(raw)
              return parsed.is_a?(Array) ? parsed.map(&:to_s).map(&:strip).reject(&:blank?).uniq : []
            rescue JSON::ParserError
              return raw.split(",").map(&:strip).reject(&:blank?).uniq
            end
          end

          []
        end

        def filter_by_role(scope)
          case params[:role].to_s
          when "technician"
            scope.where(role: :technician)
          when "company"
            scope.where(role: :company)
          else
            scope
          end
        end

        def filter_by_search(scope)
          q = params[:q].to_s.strip
          return scope if q.blank?

          like = "%#{ActiveRecord::Base.sanitize_sql_like(q.downcase)}%"
          scope.where("LOWER(users.email) LIKE ?", like)
        end

        def list_item(user)
          {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at&.iso8601,
            label: user_list_label(user),
            technician_profile_id: user.technician_profile&.id,
            company_profile_id: user.company_profile&.id
          }
        end

        def user_list_label(user)
          if user.company?
            user.company_profile&.company_name.presence || "Company"
          elsif user.technician?
            user.technician_profile&.trade_type.presence || "Technician"
          else
            user.role
          end
        end
      end
    end
  end
end
