# frozen_string_literal: true

require Rails.root.join("lib/mailtrap_http_delivery")

Mail.register_delivery_method(:mailtrap_http, MailtrapHttpDelivery)
