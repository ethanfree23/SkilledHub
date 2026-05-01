# frozen_string_literal: true

module Api
  module V1
    module Admin
      class MailtrapAuditsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin

        def show
          render json: {
            mail_delivery: MailDelivery.audit_status,
            live_automations: MailAuditCatalog.as_json[:live_automations],
            inactive_automations: MailAuditCatalog.as_json[:inactive_automations]
          }, status: :ok
        end
      end
    end
  end
end
