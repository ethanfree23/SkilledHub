# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Admin
      class UsersDestroyTest < ActionDispatch::IntegrationTest
        include AuthTestHelper

        test "admin can delete a technician user" do
          admin = User.create!(
            email: "admin-destroy-tech@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0400"
          )
          technician = User.create!(
            email: "technician-destroy@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :technician
          )
          TechnicianProfile.create!(user: technician, trade_type: "General", availability: "Full-time")

          delete "/api/v1/admin/users/#{technician.id}", headers: auth_header_for(admin)

          assert_response :no_content
          assert_nil User.find_by(id: technician.id)
        end

        test "non-admin cannot delete a user" do
          admin = User.create!(
            email: "admin-nondeleter@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0401"
          )
          technician = User.create!(
            email: "technician-nondeleter@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :technician
          )
          TechnicianProfile.create!(user: technician, trade_type: "General", availability: "Full-time")

          delete "/api/v1/admin/users/#{technician.id}", headers: auth_header_for(technician)

          assert_response :forbidden
          assert User.find_by(id: technician.id)
        end

        test "cannot delete admin target" do
          admin = User.create!(
            email: "admin-delete-target@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0402"
          )
          other_admin = User.create!(
            email: "other-admin-delete@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0403"
          )

          delete "/api/v1/admin/users/#{other_admin.id}", headers: auth_header_for(admin)

          assert_response :not_found
          body = JSON.parse(response.body)
          assert_equal ["User not found"], body["errors"]
          assert User.find_by(id: other_admin.id)
        end

        test "admin cannot delete own account" do
          admin = User.create!(
            email: "admin-self-delete@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0404"
          )

          delete "/api/v1/admin/users/#{admin.id}", headers: auth_header_for(admin)

          assert_response :unprocessable_entity
          body = JSON.parse(response.body)
          assert_includes body["errors"].first, "own account"
          assert User.find_by(id: admin.id)
        end

        test "cannot delete company primary owner while other logins are linked" do
          admin = User.create!(
            email: "admin-owner-block@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0405"
          )
          owner = User.create!(
            email: "company-owner-block@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :company
          )
          profile = CompanyProfile.create!(
            user: owner,
            membership_level: "basic",
            phone: "713-555-0406"
          )
          owner.update_column(:company_profile_id, profile.id)

          contact = User.create!(
            email: "company-contact-block@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :company
          )
          contact.update_column(:company_profile_id, profile.id)

          delete "/api/v1/admin/users/#{owner.id}", headers: auth_header_for(admin)

          assert_response :unprocessable_entity
          body = JSON.parse(response.body)
          assert_match(/other company logins/i, body["errors"].join)
          assert User.find_by(id: owner.id)
          assert User.find_by(id: contact.id)
        end

        test "admin can delete company primary owner when sole login" do
          admin = User.create!(
            email: "admin-owner-ok@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin,
            phone: "713-555-0407"
          )
          owner = User.create!(
            email: "company-owner-solo@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :company
          )
          profile = CompanyProfile.create!(
            user: owner,
            membership_level: "basic",
            phone: "713-555-0408"
          )
          owner.update_column(:company_profile_id, profile.id)
          profile_id = profile.id

          delete "/api/v1/admin/users/#{owner.id}", headers: auth_header_for(admin)

          assert_response :no_content
          assert_nil User.find_by(id: owner.id)
          assert_nil CompanyProfile.find_by(id: profile_id)
        end
      end
    end
  end
end
