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
end
