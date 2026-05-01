# frozen_string_literal: true

class EmailQaRunner
  CONFIRMATION_TEXT = "SEND_TEST_EMAILS"

  Template = Struct.new(:key, :name, :description, :active, keyword_init: true)

  TEMPLATE_DEFS = [
    Template.new(key: "welcome_email", name: "Welcome email", description: "Signup welcome message", active: true),
    Template.new(key: "password_reset_instructions", name: "Password reset instructions", description: "Self-service password reset email", active: true),
    Template.new(key: "job_posted_email", name: "Job posted", description: "Company notice after posting", active: true),
    Template.new(key: "job_claimed_email", name: "Job claimed", description: "Company notice after claim", active: true),
    Template.new(key: "payment_confirmation_email", name: "Payment confirmation", description: "Company charge confirmation", active: true),
    Template.new(key: "technician_claimed_job_email", name: "Technician claimed job", description: "Technician claim confirmation", active: true),
    Template.new(key: "job_completed_for_company", name: "Job completed (company)", description: "Completion notice to company", active: true),
    Template.new(key: "job_completed_for_technician", name: "Job completed (technician)", description: "Completion notice to technician", active: true),
    Template.new(key: "new_message", name: "New message notification", description: "Job thread message alert", active: true),
    Template.new(key: "payment_received_email", name: "Payment received", description: "Technician payout email", active: true),
    Template.new(key: "review_received_email", name: "Review received", description: "Notification after review submission", active: true),
    Template.new(key: "review_reminder_email", name: "Review reminder", description: "Reminder to leave a review", active: true),
    Template.new(key: "job_issue_report", name: "Job issue report", description: "Admin issue report alert", active: true),
    Template.new(key: "admin_feedback", name: "Admin feedback", description: "Suggestion/problem submission alert", active: true),
    Template.new(key: "job_counter_offer_received_email", name: "Counter offer received", description: "Counter offer inbound notice", active: true),
    Template.new(key: "job_counter_offer_accepted_email", name: "Counter offer accepted", description: "Counter offer accepted notice", active: true),
    Template.new(key: "job_counter_offer_declined_email", name: "Counter offer declined", description: "Counter offer declined notice", active: true),
    Template.new(key: "job_counter_offer_countered_email", name: "Counter offer updated", description: "Counter offer updated notice", active: true),
    Template.new(key: "job_accepted_email", name: "Job accepted (inactive)", description: "Defined mailer, not currently auto-triggered", active: false)
  ].freeze

  def self.templates
    TEMPLATE_DEFS.map do |template|
      {
        key: template.key,
        name: template.name,
        description: template.description,
        active: template.active
      }
    end
  end

  def initialize(admin_user:)
    @admin_user = admin_user
    @fixtures = EmailQaFixtureFactory.new(admin_user: admin_user).build
  end

  def preview(template_key)
    mail = build_mail(template_key)
    raise ArgumentError, "Unknown or unavailable template: #{template_key}" if mail.nil?

    {
      template_key: template_key,
      subject: mail.subject.to_s,
      to: [@admin_user.email],
      html_body: html_part_of(mail),
      text_body: text_part_of(mail)
    }
  end

  def send_one(template_key:, confirmation:)
    ensure_confirmation!(confirmation)
    mail = build_mail(template_key)
    raise ArgumentError, "Unknown or unavailable template: #{template_key}" if mail.nil?

    force_recipient!(mail)
    delivered = false
    MailDelivery.safe_deliver do
      mail.deliver_now
      delivered = true
    end

    {
      template_key: template_key,
      delivered: delivered,
      to: [@admin_user.email],
      subject: mail.subject.to_s
    }
  end

  def send_all(confirmation:)
    ensure_confirmation!(confirmation)

    TEMPLATE_DEFS.map do |template|
      begin
        send_one(template_key: template.key, confirmation: CONFIRMATION_TEXT)
      rescue StandardError => e
        {
          template_key: template.key,
          delivered: false,
          error: e.message
        }
      end
    end
  end

  private

  def ensure_confirmation!(value)
    return if value.to_s == CONFIRMATION_TEXT

    raise ArgumentError, "Confirmation text is required to send test emails."
  end

  def build_mail(template_key)
    case template_key.to_s
    when "welcome_email"
      UserMailer.welcome_email(@fixtures[:admin_user])
    when "password_reset_instructions"
      UserMailer.password_reset_instructions(@fixtures[:admin_user], reason: :self_service)
    when "job_posted_email"
      UserMailer.job_posted_email(@fixtures[:job])
    when "job_claimed_email"
      UserMailer.job_claimed_email(@fixtures[:job])
    when "job_accepted_email"
      UserMailer.job_accepted_email(@fixtures[:job])
    when "new_message"
      UserMailer.new_message(@fixtures[:message])
    when "payment_confirmation_email"
      UserMailer.payment_confirmation_email(@fixtures[:job], 12_345)
    when "payment_received_email"
      UserMailer.payment_received_email(@fixtures[:job], 12_345)
    when "review_received_email"
      UserMailer.review_received_email(@fixtures[:rating])
    when "review_reminder_email"
      UserMailer.review_reminder_email(@fixtures[:job], @fixtures[:admin_user], :company)
    when "job_completed_for_company"
      UserMailer.job_completed_for_company(@fixtures[:job])
    when "job_completed_for_technician"
      UserMailer.job_completed_for_technician(@fixtures[:job])
    when "technician_claimed_job_email"
      UserMailer.technician_claimed_job_email(@fixtures[:job])
    when "job_issue_report"
      UserMailer.job_issue_report(@fixtures[:issue_report])
    when "admin_feedback"
      UserMailer.admin_feedback(@fixtures[:feedback_submission])
    when "job_counter_offer_received_email"
      UserMailer.job_counter_offer_received_email(@fixtures[:offer])
    when "job_counter_offer_accepted_email"
      UserMailer.job_counter_offer_accepted_email(@fixtures[:offer])
    when "job_counter_offer_declined_email"
      UserMailer.job_counter_offer_declined_email(@fixtures[:offer])
    when "job_counter_offer_countered_email"
      UserMailer.job_counter_offer_countered_email(@fixtures[:offer])
    end
  end

  def force_recipient!(mail)
    mail.to = [@admin_user.email]
    mail.cc = nil
    mail.bcc = nil
  end

  def html_part_of(mail)
    part = mail.html_part
    return part.body.decoded if part
    return mail.body.decoded if mail.content_type.to_s.include?("text/html")

    ""
  end

  def text_part_of(mail)
    part = mail.text_part
    return part.body.decoded if part
    return mail.body.decoded if mail.content_type.to_s.include?("text/plain")

    ""
  end
end
