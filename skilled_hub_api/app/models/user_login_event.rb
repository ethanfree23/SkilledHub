# frozen_string_literal: true

class UserLoginEvent < ApplicationRecord
  # Only created_at is meaningful for analytics; updated_at is unused.
  belongs_to :user
end
