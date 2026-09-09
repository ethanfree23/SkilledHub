# frozen_string_literal: true

require "test_helper"

class GhlProfilePhotoUrlExtractorTest < ActiveSupport::TestCase
  test "reads profile_photo_url" do
    url = GhlProfilePhotoUrlExtractor.first_url(
      "profile_photo_url" => "https://cdn.example.com/mms/photo.jpg"
    )
    assert_equal "https://cdn.example.com/mms/photo.jpg", url
  end

  test "reads GHL message.attachments JSON array string" do
    url = GhlProfilePhotoUrlExtractor.first_url(
      "profile_photo_url" => '["https://services.msgsndr.com/a.jpg","https://services.msgsndr.com/b.jpg"]'
    )
    assert_equal "https://services.msgsndr.com/a.jpg", url
  end

  test "reads attachments array of hashes" do
    url = GhlProfilePhotoUrlExtractor.first_url(
      "attachments" => [{ "url" => "https://media.twilio.com/mms/1", "type" => "image" }]
    )
    assert_equal "https://media.twilio.com/mms/1", url
  end

  test "ignores uninterpolated GHL tokens and blank values" do
    assert_nil GhlProfilePhotoUrlExtractor.first_url("profile_photo_url" => "{{message.attachments}}")
    assert_nil GhlProfilePhotoUrlExtractor.first_url("profile_photo_url" => "")
    assert_nil GhlProfilePhotoUrlExtractor.first_url("attachments" => [])
  end
end
