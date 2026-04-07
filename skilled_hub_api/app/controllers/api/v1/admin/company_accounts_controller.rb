# frozen_string_literal: true

module Api
  module V1
    module Admin
      class CompanyAccountsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

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
      end
    end
  end
end
