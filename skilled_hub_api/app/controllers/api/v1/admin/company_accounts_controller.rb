# frozen_string_literal: true

module Api
  module V1
    module Admin
      class CompanyAccountsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        # POST /api/v1/admin/company_accounts
        # Creates a company user + company profile; initial password is derived from email;
        # sends password-reset email so they can choose a real password.
        def create
          result = AdminAccountProvisioner.provision_company!(
            email: provision_params[:email],
            company_name: provision_params[:company_name],
            industry: provision_params[:industry],
            location: provision_params[:location],
            bio: provision_params[:bio]
          )

          render json: {
            user: UserSerializer.new(result[:user]).as_json,
            company_profile: CompanyProfileSerializer.new(result[:profile]).as_json
          }, status: :created
        rescue AdminAccountProvisioner::Error => e
          render json: { errors: [e.message] }, status: :unprocessable_entity
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        # GET /api/v1/admin/company_accounts/search?q=
        def search
          q = params[:q].to_s.strip
          if q.blank?
            return render json: { users: [] }, status: :ok
          end

          scope = User.company.includes(:company_profile)
          like = "%#{ActiveRecord::Base.sanitize_sql_like(q.downcase)}%"
          scope = scope.where("LOWER(users.email) LIKE ?", like)
          users = scope.order(:email).limit(30)
          render json: {
            users: users.map do |u|
              cp = u.company_profile
              {
                id: u.id,
                email: u.email,
                company_profile_id: cp&.id,
                company_name: cp&.company_name
              }
            end
          }, status: :ok
        end

        private

        def provision_params
          params.permit(:email, :company_name, :industry, :location, :bio)
        end
      end
    end
  end
end
