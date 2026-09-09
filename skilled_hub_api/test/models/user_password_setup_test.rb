# frozen_string_literal: true

require "test_helper"

class UserPasswordSetupTest < ActiveSupport::TestCase
  test "ghl-style system password is eligible for first-time setup" do
    user = User.create!(
      email: "setup-eligible@example.com",
      password: "SystemPass1!",
      password_confirmation: "SystemPass1!",
      role: :technician,
      password_set_actor: "system"
    )

    assert user.first_time_password_setup_eligible?
    refute user.password_already_established?
    assert_equal "s***e@example.com", user.masked_email
  end

  test "established technician password is not eligible" do
    user = User.create!(
      email: "already-set@example.com",
      password: "UserPass1!",
      password_confirmation: "UserPass1!",
      role: :technician,
      password_set_actor: "user"
    )

    refute user.first_time_password_setup_eligible?
    assert user.password_already_established?
  end

  test "masked email uses first and last local characters" do
    user = User.new(email: "ethan@gmail.com")
    assert_equal "e***n@gmail.com", user.masked_email
  end
end
