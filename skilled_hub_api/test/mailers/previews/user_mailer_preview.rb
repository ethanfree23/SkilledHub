# frozen_string_literal: true

# Development: open http://localhost:3000/rails/mailers (use your API port if different)
class UserMailerPreview < ActionMailer::Preview
  def admin_account_setup_company
    user = User.new(email: 'owner@acme-plumbing.com', role: :company)
    user.password_reset_token = 'preview-token-example'
    UserMailer.admin_account_setup_email(user)
  end

  def admin_account_setup_technician
    user = User.new(email: 'tech@example.com', role: :technician)
    user.password_reset_token = 'preview-token-example'
    UserMailer.admin_account_setup_email(user)
  end

  def password_reset_instructions
    user = User.new(email: 'user@example.com', role: :company)
    user.password_reset_token = 'preview-token-example'
    UserMailer.password_reset_instructions(user)
  end

  def membership_checkout_thanks
    user = User.new(email: 'company@example.com', role: :company)
    UserMailer.membership_checkout_thanks(user, membership_level: "pro")
  end

  def membership_invoice_paid_notice
    user = User.new(email: 'company@example.com', role: :company)
    UserMailer.membership_invoice_paid_notice(
      user: user,
      amount_cents: 25_000,
      period_start: 1.month.ago,
      period_end: Time.current,
      hosted_invoice_url: "https://dashboard.stripe.com/invoices/in_preview",
      invoice_number: "TF-PREVIEW-001"
    )
  end
end
