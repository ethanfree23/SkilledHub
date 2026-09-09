# frozen_string_literal: true

require "test_helper"

class GhlIntakeParserTest < ActiveSupport::TestCase
  test "prefers payload email over contact-info email" do
    parsed = GhlIntakeParser.parse(
      email: "payload@example.com",
      contact_info: "other@example.com / 77002"
    )

    assert_equal "payload@example.com", parsed[:email]
    assert_equal "77002", parsed[:zip_code]
  end

  test "parses slash format email and zip" do
    parsed = GhlIntakeParser.parse(
      email: nil,
      contact_info: "tech@example.com / 77002"
    )

    assert_equal "tech@example.com", parsed[:email]
    assert_equal "77002", parsed[:zip_code]
  end

  test "parses labeled newlines" do
    parsed = GhlIntakeParser.parse(
      email: "",
      contact_info: "Email: john@email.com\nZIP: 77002"
    )

    assert_equal "john@email.com", parsed[:email]
    assert_equal "77002", parsed[:zip_code]
  end

  test "downcases parsed email and ignores punctuation" do
    parsed = GhlIntakeParser.parse(
      email: "  John.Smith@Email.COM  ",
      contact_info: "zip code — 75201."
    )

    assert_equal "john.smith@email.com", parsed[:email]
    assert_equal "75201", parsed[:zip_code]
  end

  test "returns nils when nothing parseable" do
    parsed = GhlIntakeParser.parse(email: "not-an-email", contact_info: "hello")

    assert_nil parsed[:email]
    assert_nil parsed[:zip_code]
  end

  test "prefers structured zip over contact-info zip" do
    parsed = GhlIntakeParser.parse(
      email: "lead@example.com",
      contact_info: "77002",
      zip_code: "75201"
    )

    assert_equal "lead@example.com", parsed[:email]
    assert_equal "75201", parsed[:zip_code]
  end

  test "parses postal_code alias" do
    parsed = GhlIntakeParser.parse(email: "lead@example.com", postal_code: "TX 77002-1234")
    assert_equal "77002", parsed[:zip_code]
  end

  test "splits full name when first and last are blank" do
    names = GhlIntakeParser.split_name(full_name: "Jordan Lee")
    assert_equal "Jordan", names[:first_name]
    assert_equal "Lee", names[:last_name]
  end

  test "keeps explicit first and last name over full name" do
    names = GhlIntakeParser.split_name(full_name: "Ignore Me", first_name: "Jordan", last_name: "Lee")
    assert_equal "Jordan", names[:first_name]
    assert_equal "Lee", names[:last_name]
  end

  test "parses years money miles and booleans from ghl strings" do
    assert_equal 8, GhlIntakeParser.parse_years("8 years")
    assert_equal 4_500, GhlIntakeParser.parse_money_cents("$45")
    assert_equal 4_500, GhlIntakeParser.parse_money_cents(45)
    assert_equal 50, GhlIntakeParser.parse_miles("50 miles")
    assert_equal true, GhlIntakeParser.parse_boolean("Yes")
    assert_equal false, GhlIntakeParser.parse_boolean("No")
    assert_nil GhlIntakeParser.parse_boolean("")
  end
end
