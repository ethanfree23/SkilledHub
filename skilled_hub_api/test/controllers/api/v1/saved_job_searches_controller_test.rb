require "test_helper"

module Api
  module V1
    class SavedJobSearchesControllerTest < ActionDispatch::IntegrationTest
      include AuthTestHelper

      test "technician can create and list template criteria fields" do
        user = User.create!(
          email: "saved-template-tech@example.com",
          password: "password123",
          password_confirmation: "password123",
          role: :technician
        )
        TechnicianProfile.create!(
          user: user,
          trade_type: "HVAC",
          experience_years: 5,
          availability: "Full-time"
        )

        post "/api/v1/saved_job_searches",
             params: {
               keyword: "chiller",
               location: "Houston",
               skill_class: "hvac",
               max_distance_miles: 25,
               min_hourly_rate_cents: 5000,
               max_required_years_experience: 6,
               required_certifications: ["EPA", "OSHA"]
             },
             headers: auth_header_for(user),
             as: :json

        assert_response :created
        created = JSON.parse(response.body)
        assert_equal 25, created["max_distance_miles"]
        assert_equal 5000, created["min_hourly_rate_cents"]
        assert_equal 6, created["max_required_years_experience"]
        assert_equal ["epa", "osha"], created["required_certifications"]

        get "/api/v1/saved_job_searches", headers: auth_header_for(user), as: :json
        assert_response :ok
        body = JSON.parse(response.body)
        assert_equal 1, body.size
        assert_equal ["epa", "osha"], body.first["required_certifications"]
      end
    end
  end
end
