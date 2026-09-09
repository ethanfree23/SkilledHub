# frozen_string_literal: true

class GhlProfilePhotoAttacher
  class Error < StandardError; end

  def self.attach!(profile, fetched)
    new(profile, fetched).attach!
  end

  def initialize(profile, fetched)
    @profile = profile
    @fetched = fetched
  end

  def attach!
    raise Error, "technician profile is missing" if @profile.blank?
    raise Error, "downloaded image is missing" if @fetched.blank? || @fetched.io.blank?

    @fetched.io.rewind if @fetched.io.respond_to?(:rewind)
    @profile.avatar.purge if @profile.avatar.attached?
    @profile.avatar.attach(
      io: @fetched.io,
      filename: @fetched.filename.presence || "ghl-profile-photo.jpg",
      content_type: @fetched.content_type.presence || "image/jpeg"
    )
    @profile.updated_at = Time.current
    @profile.save!
    @profile
  rescue ActiveRecord::RecordInvalid => e
    raise Error, e.record.errors.full_messages.to_sentence.presence || e.message
  end
end
