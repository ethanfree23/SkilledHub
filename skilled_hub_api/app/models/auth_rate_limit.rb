# frozen_string_literal: true

class AuthRateLimit < ApplicationRecord
  def self.throttle!(scope:, bucket:, limit:, window:)
    now = Time.current
    key = bucket.to_s.presence || "unknown"
    cleanup_old_windows!(scope: scope, bucket: key, window: window)

    record = where(scope: scope, bucket: key)
             .where("window_starts_at > ?", window.ago)
             .order(window_starts_at: :desc)
             .first

    if record.nil?
      create!(scope: scope, bucket: key, count: 1, window_starts_at: now)
      return { limited: false, retry_after: nil }
    end

    if record.count >= limit
      retry_after = [(record.window_starts_at + window - now).ceil, 1].max
      return { limited: true, retry_after: retry_after }
    end

    record.increment!(:count)
    { limited: false, retry_after: nil }
  end

  def self.cleanup_old_windows!(scope:, bucket:, window:)
    where(scope: scope, bucket: bucket).where("window_starts_at <= ?", (window * 2).ago).delete_all
  end
  private_class_method :cleanup_old_windows!
end
