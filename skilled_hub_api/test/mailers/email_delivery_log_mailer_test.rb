# frozen_string_literal: true

require "test_helper"

class EmailDeliveryLogMailerTest < ActionMailer::TestCase
  setup do
    ActionMailer::Base.deliveries.clear
    @user =
      User.create!(
        email: "email-ledger-mailer@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: :technician
      )
    TechnicianProfile.create!(user: @user, trade_type: "General", availability: "Full-time")
    @user.generate_password_reset_token!
  end

  test "records email_delivery_logs after successful delivery" do
    assert_difference -> { EmailDeliveryLog.count }, 1 do
      UserMailer.password_reset_instructions(@user).deliver_now
    end

    log = EmailDeliveryLog.order(:id).last
    assert_equal @user.id, log.user_id
    assert_equal @user.email.downcase, log.to_email
    assert_equal "UserMailer", log.mailer_class
    assert_equal "password_reset_instructions", log.mailer_action
    assert_match(/reset your techflash password/i, log.subject.to_s)
  end
end
