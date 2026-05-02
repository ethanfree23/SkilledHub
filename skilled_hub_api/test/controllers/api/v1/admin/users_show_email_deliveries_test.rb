# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Admin
      class UsersShowEmailDeliveriesTest < ActionDispatch::IntegrationTest
        include AuthTestHelper

        test "admin user show includes email_deliveries for technician" do
          admin =
            User.create!(
              email: "admin-email-deliveries@example.com",
              password: "password123",
              password_confirmation: "password123",
              role: :admin
            )
          technician =
            User.create!(
              email: "tech-email-deliveries@example.com",
              password: "password123",
              password_confirmation: "password123",
              role: :technician
            )
          TechnicianProfile.create!(user: technician, trade_type: "General", availability: "Full-time")

          EmailDeliveryLog.create!(
            user_id: technician.id,
            to_email: technician.email.downcase,
            mailer_class: "UserMailer",
            mailer_action: "welcome_email",
            subject: "Welcome to TechFlash!",
            created_at: Time.current
          )

          get "/api/v1/admin/users/#{technician.id}",
              headers: auth_header_for(admin),
              as: :json

          assert_response :ok
          body = JSON.parse(response.body)
          assert_equal 1, body["email_deliveries"]["total_in_period"]
          recent = body["email_deliveries"]["recent"]
          assert_equal 1, recent.size
          assert_equal "UserMailer", recent.first["mailer_class"]
          assert_equal "welcome_email", recent.first["mailer_action"]
          assert_equal "sent", recent.first["status"]
        end
      end
    end
  end
end
