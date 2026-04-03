# frozen_string_literal: true

# Wraps mail sends so SMTP/template failures do not fail HTTP requests (especially with
# config.active_job.queue_adapter = :inline, which runs deliver_later during the request).
module MailDelivery
  def self.safe_deliver
    yield
  rescue StandardError => e
    Rails.logger.error("[mail] #{e.class}: #{e.message}\n#{e.backtrace.first(12).join("\n")}")
    nil
  end
end
