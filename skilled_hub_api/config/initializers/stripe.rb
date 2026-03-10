# frozen_string_literal: true

# Stripe API key: prefer Rails credentials, fall back to ENV (from .env)
Stripe.api_key = Rails.application.credentials.dig(:stripe, :secret_key) ||
                 ENV.fetch('STRIPE_SECRET_KEY', nil)
