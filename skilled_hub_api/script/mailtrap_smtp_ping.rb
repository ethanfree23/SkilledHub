#!/usr/bin/env ruby
# frozen_string_literal: true

# SMTP test only — no Rails, no database.
# From skilled_hub_api:
#   railway run ruby script/mailtrap_smtp_ping.rb
#
# Requires on the TechFlash service: SMTP_*, MAILER_FROM, and for this script:
#   MAIL_TEST_TO=you@email.com

require "net/smtp"

from = ENV.fetch("MAILER_FROM") { abort "Set MAILER_FROM" }
to   = ENV.fetch("MAIL_TEST_TO") { abort "Set MAIL_TEST_TO=your@email.com" }

host = ENV.fetch("SMTP_ADDRESS", "live.smtp.mailtrap.io")
port = ENV.fetch("SMTP_PORT", "587").to_i
user = ENV.fetch("SMTP_USERNAME", "api")
pass = ENV.fetch("SMTP_PASSWORD") { abort "Set SMTP_PASSWORD (Mailtrap API token)" }

auth = (ENV["SMTP_AUTHENTICATION"] || "login").downcase.to_sym
auth = :plain unless %i[plain login].include?(auth)

body = <<~MSG
  From: #{from}
  To: #{to}
  Subject: TechFlash SMTP ping (no Rails)
  MIME-Version: 1.0
  Content-Type: text/plain; charset=UTF-8

  If this appears in Mailtrap, Railway SMTP env vars are OK.
MSG

puts "Connecting #{host}:#{port} as #{user} (auth=#{auth})..."
Net::SMTP.start(host, port, "localhost", user, pass, auth) do |smtp|
  smtp.send_message(body, from, [to])
end
puts "Sent OK — check Mailtrap Email Logs and #{to}"
