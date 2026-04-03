# frozen_string_literal: true

namespace :mail do
  desc "Verify SMTP via Rails (needs working DATABASE_URL). If DB fails locally, use: ruby script/mailtrap_smtp_ping.rb"
  task test_smtp: :environment do
    puts "SMTP_ADDRESS=#{ENV['SMTP_ADDRESS'].inspect}"
    puts "SMTP_USERNAME=#{ENV['SMTP_USERNAME'].inspect}"
    puts "SMTP_PASSWORD=#{(ENV['SMTP_PASSWORD'].presence && '[set]') || '[MISSING]'}"
    puts "MAILER_FROM=#{ENV['MAILER_FROM'].inspect}"

    unless ENV['SMTP_ADDRESS'].present? && ENV['SMTP_PASSWORD'].present?
      puts "ERROR: SMTP_ADDRESS and SMTP_PASSWORD must be set."
      exit 1
    end

    to = ENV['MAIL_TEST_TO'].presence || User.order(:id).first&.email
    unless to
      puts "ERROR: No users in DB; set MAIL_TEST_TO=your@email.com"
      exit 1
    end

    user = User.find_by(email: to) || User.order(:id).first
    puts "Sending welcome_email to #{user.email}..."
    UserMailer.welcome_email(user).deliver_now
    puts "OK — check Mailtrap Email Logs and inbox for #{user.email}"
  rescue StandardError => e
    warn "#{e.class}: #{e.message}"
    warn e.backtrace.first(15).join("\n")
    exit 1
  end
end
