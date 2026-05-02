# frozen_string_literal: true

class EmailDeliveryLog < ApplicationRecord
  belongs_to :user, optional: true
end
