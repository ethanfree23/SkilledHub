# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Admin
      class UsersIndexTest < ActionDispatch::IntegrationTest
        include AuthTestHelper
        include ActiveSupport::Testing::TimeHelpers

        test "index returns logins_last_30_days excluding masquerade-marked events" do
          admin = User.create!(
            email: "admin-index-login@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0500"
          )
          u1 = User.create!(
            email: "tech-login-count@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :technician
          )
          TechnicianProfile.create!(user: u1, trade_type: "General", availability: "Full-time")
          u2 = User.create!(
            email: "tech-login-masq@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :technician
          )
          TechnicianProfile.create!(user: u2, trade_type: "Electric", availability: "Full-time")

          t = Time.zone.now
          travel_to t do
            2.times do
              UserLoginEvent.create!(user_id: u1.id, via_masquerade: false, created_at: 1.day.ago)
            end
            UserLoginEvent.create!(user_id: u2.id, via_masquerade: false, created_at: 1.day.ago)
            UserLoginEvent.create!(user_id: u2.id, via_masquerade: true, created_at: 1.day.ago)
            UserLoginEvent.create!(
              user_id: u1.id,
              via_masquerade: false,
              created_at: 31.days.ago
            )
          end

          get "/api/v1/admin/users", headers: auth_header_for(admin)
          assert_response :ok
          body = JSON.parse(response.body)
          rows = body["users"].index_by { |r| r["id"] }
          assert_equal 2, rows[u1.id]["logins_last_30_days"]
          assert_equal 1, rows[u2.id]["logins_last_30_days"]
        end
      end
    end
  end
end
