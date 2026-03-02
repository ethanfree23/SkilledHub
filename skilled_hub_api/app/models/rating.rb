class Rating < ApplicationRecord
  belongs_to :job
  belongs_to :reviewer, polymorphic: true
  belongs_to :reviewee, polymorphic: true

  validates :score, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
end
