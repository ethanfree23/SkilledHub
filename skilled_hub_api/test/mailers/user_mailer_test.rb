# frozen_string_literal: true

require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  setup do
    ActionMailer::Base.deliveries.clear
    @admin = User.create!(
      email: "mailer-qa-admin@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :admin
    )
    @fixtures = EmailQaFixtureFactory.new(admin_user: @admin).build
  end

  test "all transactional mailer methods render and are deliverable" do
    messages = build_all_messages

    messages.each do |key, mail|
      assert_not_nil mail, "#{key} should render a mail object"
      assert mail.subject.present?, "#{key} should include a subject"
      assert mail.to.present?, "#{key} should include recipients"
      assert_includes [mail.text_part.present?, mail.html_part.present?, mail.body.decoded.present?], true
    end

    assert_emails messages.size do
      messages.each_value(&:deliver_now)
    end
  end

  test "admin account setup email uses welcome aboard subject" do
    user = @fixtures[:technician_user]
    user.generate_password_reset_token! unless user.password_reset_token_active?
    mail = UserMailer.admin_account_setup_email(user)
    assert_match(/account is ready/i, mail.subject)
  end

  private

  def build_all_messages
    {
      welcome_email: UserMailer.welcome_email(@fixtures[:admin_user]),
      password_reset_instructions: UserMailer.password_reset_instructions(@fixtures[:admin_user]),
      admin_account_setup_email: UserMailer.admin_account_setup_email(@fixtures[:technician_user].tap do |u|
        u.generate_password_reset_token! unless u.password_reset_token_active?
      end),
      membership_checkout_thanks: UserMailer.membership_checkout_thanks(@fixtures[:company_user], membership_level: @fixtures[:company_profile].membership_level),
      membership_invoice_paid_notice: UserMailer.membership_invoice_paid_notice(
        user: @fixtures[:company_user],
        amount_cents: 25_000,
        period_start: 1.month.ago.beginning_of_day,
        period_end: Time.current.end_of_day,
        hosted_invoice_url: "https://dashboard.stripe.com/invoices/in_test",
        invoice_number: "TF-TEST-001"
      ),
      job_posted_email: UserMailer.job_posted_email(@fixtures[:job]),
      job_claimed_email: UserMailer.job_claimed_email(@fixtures[:job]),
      job_accepted_email: UserMailer.job_accepted_email(@fixtures[:job]),
      new_message: UserMailer.new_message(@fixtures[:message]),
      payment_confirmation_email: UserMailer.payment_confirmation_email(@fixtures[:job], 12_345),
      payment_received_email: UserMailer.payment_received_email(@fixtures[:job], 12_345),
      review_received_email: UserMailer.review_received_email(@fixtures[:rating]),
      review_reminder_email: UserMailer.review_reminder_email(@fixtures[:job], @fixtures[:admin_user], :company),
      job_completed_for_company: UserMailer.job_completed_for_company(@fixtures[:job]),
      job_completed_for_technician: UserMailer.job_completed_for_technician(@fixtures[:job]),
      technician_claimed_job_email: UserMailer.technician_claimed_job_email(@fixtures[:job]),
      job_issue_report: UserMailer.job_issue_report(@fixtures[:issue_report]),
      admin_feedback: UserMailer.admin_feedback(@fixtures[:feedback_submission]),
      job_counter_offer_received_email: UserMailer.job_counter_offer_received_email(@fixtures[:offer]),
      job_counter_offer_accepted_email: UserMailer.job_counter_offer_accepted_email(@fixtures[:offer]),
      job_counter_offer_declined_email: UserMailer.job_counter_offer_declined_email(@fixtures[:offer]),
      job_counter_offer_countered_email: UserMailer.job_counter_offer_countered_email(@fixtures[:offer])
    }
  end
end
