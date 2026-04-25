require "test_helper"

module Api
  module V1
    class JobsControllerTest < ActionDispatch::IntegrationTest
      include AuthTestHelper

      test "company with waived membership fee can create job without saved card" do
        user = User.create!(
          email: "company-waived-posting@example.com",
          password: "password123",
          password_confirmation: "password123",
          role: :company
        )
        profile = CompanyProfile.create!(
          user: user,
          membership_level: "premium",
          membership_fee_waived: true
        )
        user.update_column(:company_profile_id, profile.id)

        post "/api/v1/jobs",
             params: {
               title: "Billing exempt posting",
               description: "Can post without saved card",
               status: "open",
               company_profile_id: profile.id
             },
             headers: auth_header_for(user),
             as: :json

        assert_response :created
      end

      test "technician can claim paid job for billing exempt company without payment method" do
        company_user = User.create!(
          email: "company-waived-claim@example.com",
          password: "password123",
          password_confirmation: "password123",
          role: :company
        )
        company_profile = CompanyProfile.create!(
          user: company_user,
          membership_level: "premium",
          membership_fee_waived: true
        )
        company_user.update_column(:company_profile_id, company_profile.id)

        job = Job.create!(
          company_profile: company_profile,
          title: "Paid exempt claim",
          description: "desc",
          status: :open,
          hourly_rate_cents: 5_000,
          hours_per_day: 1,
          days: 1,
          scheduled_start_at: 1.hour.from_now,
          scheduled_end_at: 5.hours.from_now
        )

        technician_user = User.create!(
          email: "tech-waived-claim@example.com",
          password: "password123",
          password_confirmation: "password123",
          role: :technician
        )
        TechnicianProfile.create!(
          user: technician_user,
          trade_type: "General",
          availability: "Full-time"
        )

        patch "/api/v1/jobs/#{job.id}/claim",
              headers: auth_header_for(technician_user),
              as: :json

        assert_response :ok
        job.reload
        assert_equal "filled", job.status
        assert_equal 0, job.payments.count
      end
    end
  end
end
