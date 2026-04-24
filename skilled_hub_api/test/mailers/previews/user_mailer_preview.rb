# frozen_string_literal: true

# Development: open http://localhost:3000/rails/mailers (use your API port if different)
class UserMailerPreview < ActionMailer::Preview
  def password_reset_instructions_admin_company
    user = User.new(email: 'owner@acme-plumbing.com', role: :company)
    user.password_reset_token = 'preview-token-example'
    UserMailer.password_reset_instructions(user, reason: :admin_provisioned)
  end

  def password_reset_instructions_admin_technician
    user = User.new(email: 'tech@example.com', role: :technician)
    user.password_reset_token = 'preview-token-example'
    UserMailer.password_reset_instructions(user, reason: :admin_provisioned)
  end

  def password_reset_instructions_self_service
    user = User.new(email: 'user@example.com', role: :company)
    user.password_reset_token = 'preview-token-example'
    UserMailer.password_reset_instructions(user, reason: :self_service)
  end
end
