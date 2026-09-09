# frozen_string_literal: true

module PasswordSetup
  Result = Struct.new(:http_status, :body, keyword_init: true)
end
