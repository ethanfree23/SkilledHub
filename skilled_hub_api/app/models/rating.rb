class Rating < ApplicationRecord
  # Categories when a company reviews a tech
  COMPANY_REVIEW_CATEGORIES = {
    punctuality: 'Show up on time',
    attention_to_detail: 'Attention to detail / Following instructions',
    teamwork: 'Work well with others',
    job_satisfaction: 'Complete the job to satisfaction',
    communication: 'Clear communication'
  }.freeze

  # Categories when a tech reviews a company
  TECH_REVIEW_CATEGORIES = {
    job_title_accuracy: 'Job title matched the actual work',
    materials_provided: 'Provided everything needed (materials, etc.)',
    time_respect: 'Respected my time (no unexpected overtime)',
    ease_to_work_with: 'Easy to work with',
    would_work_again: 'Would work with again'
  }.freeze

  belongs_to :job
  belongs_to :reviewer, polymorphic: true
  belongs_to :reviewee, polymorphic: true

  validate :validate_category_scores, if: -> { category_scores.present? }
  validates :score, presence: true, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }

  before_validation :compute_score_from_categories, if: -> { category_scores.present? && score.blank? }

  def self.categories_for(reviewer_type)
    reviewer_type.to_s == 'CompanyProfile' ? COMPANY_REVIEW_CATEGORIES : TECH_REVIEW_CATEGORIES
  end

  def self.average_for(reviewee)
    return nil if reviewee.nil?
    ratings = where(reviewee: reviewee)
    return nil if ratings.empty?
    (ratings.sum(:score) / ratings.count.to_f).round(2)
  end

  def category_labels
    self.class.categories_for(reviewer_type)
  end

  private

  def validate_category_scores
    return if category_scores.blank?
    expected_keys = reviewer_type.to_s == 'CompanyProfile' ? COMPANY_REVIEW_CATEGORIES.keys.map(&:to_s) : TECH_REVIEW_CATEGORIES.keys.map(&:to_s)
    given_keys = category_scores.keys
    missing = expected_keys - given_keys
    extra = given_keys - expected_keys
    if missing.any?
      errors.add(:category_scores, "missing required categories: #{missing.join(', ')}")
    end
    if extra.any?
      errors.add(:category_scores, "unknown categories: #{extra.join(', ')}")
    end
    return if errors[:category_scores].any?
    category_scores.each do |k, v|
      val = v.to_i
      unless val.between?(1, 5)
        errors.add(:category_scores, "#{k} must be between 1 and 5")
        break
      end
    end
  end

  def compute_score_from_categories
    return if category_scores.blank? || !category_scores.is_a?(Hash)
    values = category_scores.values.map { |v| v.to_i }.select { |v| v.between?(1, 5) }
    return if values.empty?
    self.score = (values.sum.to_f / values.size).round(2)
  end
end
