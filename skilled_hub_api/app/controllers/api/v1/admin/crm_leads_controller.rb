# frozen_string_literal: true

module Api
  module V1
    module Admin
      class CrmLeadsController < ApplicationController
        before_action :authenticate_user
        before_action :require_admin
        before_action :set_lead, only: %i[show update destroy]

        def index
          leads = CrmLead.order(updated_at: :desc)
          render json: { crm_leads: leads.map { |l| lead_json(l) } }, status: :ok
        end

        def show
          payload = { crm_lead: lead_json(@lead) }
          append_linked_payload(payload, @lead)
          payload[:crm_notes] = crm_notes_payload(@lead)
          render json: payload, status: :ok
        end

        def create
          lead = CrmLead.new(lead_params)
          if lead.save
            payload = { crm_lead: lead_json(lead) }
            append_linked_payload(payload, lead)
            render json: payload, status: :created
          else
            render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @lead.update(lead_params)
            payload = { crm_lead: lead_json(@lead) }
            append_linked_payload(payload, @lead)
            render json: payload, status: :ok
          else
            render json: { errors: @lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @lead.destroy
          head :no_content
        end

        def import
          rows = params[:rows]
          unless rows.is_a?(Array)
            return render json: { error: "rows must be an array" }, status: :unprocessable_entity
          end

          consolidated_rows = consolidate_import_rows(rows)
          created = []
          errors = []

          consolidated_rows.each do |entry|
            row = entry[:row]
            lead = CrmLead.new(row)

            if lead.save
              created << lead
            else
              errors << {
                row: entry[:row_numbers].first,
                name: row[:name],
                source_rows: entry[:row_numbers],
                errors: lead.errors.full_messages
              }
            end
          end

          render json: {
            imported_count: created.count,
            failed_count: errors.count,
            crm_leads: created.map { |l| lead_json(l) },
            errors: errors
          }, status: :ok
        end

        def bulk_destroy
          ids = Array(params[:ids]).map(&:to_i).select(&:positive?).uniq
          if ids.empty?
            return render json: { error: "ids must be a non-empty array" }, status: :unprocessable_entity
          end

          existing_ids = CrmLead.where(id: ids).pluck(:id)
          deleted_count = CrmLead.where(id: existing_ids).delete_all
          not_found_ids = ids - existing_ids

          render json: {
            deleted_count: deleted_count,
            requested_count: ids.count,
            not_found_ids: not_found_ids
          }, status: :ok
        end

        private

        def set_lead
          @lead = CrmLead.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "CRM record not found" }, status: :not_found
        end

        def lead_params
          p = params.permit(
            :name,
            :contact_name,
            :email,
            :phone,
            :website,
            :street_address,
            :city,
            :state,
            :zip,
            :instagram_url,
            :facebook_url,
            :linkedin_url,
            :status,
            :notes,
            :linked_user_id,
            :linked_company_profile_id,
            company_types: [],
            contacts: %i[name email phone]
          )
          p[:linked_user_id] = nil if p.key?(:linked_user_id) && p[:linked_user_id].blank?
          p[:linked_company_profile_id] = nil if p.key?(:linked_company_profile_id) && p[:linked_company_profile_id].blank?
          if p[:linked_company_profile_id].present? && p[:linked_user_id].blank?
            p[:linked_user_id] = User.find_by(company_profile_id: p[:linked_company_profile_id], role: :company)&.id
          elsif p[:linked_user_id].present? && p[:linked_company_profile_id].blank?
            p[:linked_company_profile_id] = User.find_by(id: p[:linked_user_id])&.company_profile&.id
          end
          p
        end

        def lead_json(lead)
          lu = lead.linked_user
          linked_profile = lead.linked_company_profile || lu&.company_profile
          {
            id: lead.id,
            name: lead.name,
            contact_name: lead.contact_name,
            email: lead.email,
            phone: lead.phone,
            website: lead.website,
            street_address: lead.street_address,
            city: lead.city,
            state: lead.state,
            zip: lead.zip,
            instagram_url: lead.instagram_url,
            facebook_url: lead.facebook_url,
            linkedin_url: lead.linkedin_url,
            status: lead.status,
            company_types: lead.company_types || [],
            contacts: lead.contacts || [],
            notes: lead.notes,
            linked_user_id: lead.linked_user_id,
            linked_company_profile_id: linked_profile&.id,
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            linked_account: linked_account_json(lu, linked_profile)
          }
        end

        def crm_notes_payload(lead)
          lead.crm_notes.where(parent_note_id: nil).order(created_at: :asc).map do |note|
            {
              id: note.id,
              crm_lead_id: note.crm_lead_id,
              parent_note_id: note.parent_note_id,
              contact_method: note.contact_method,
              title: note.title,
              body: note.body,
              made_contact: note.made_contact,
              created_at: note.created_at,
              updated_at: note.updated_at,
              comments: note.comments.order(created_at: :asc).map do |comment|
                {
                  id: comment.id,
                  crm_lead_id: comment.crm_lead_id,
                  parent_note_id: comment.parent_note_id,
                  contact_method: comment.contact_method,
                  title: comment.title,
                  body: comment.body,
                  made_contact: comment.made_contact,
                  created_at: comment.created_at,
                  updated_at: comment.updated_at
                }
              end
            }
          end
        end

        def linked_account_json(user, company_profile)
          return nil unless user || company_profile
          {
            user_id: user&.id,
            email: user&.email,
            company_profile_id: company_profile&.id,
            company_name: company_profile&.company_name,
            company_user_count: company_profile ? company_profile.company_users.where(role: :company).count : 0
          }
        end

        def append_linked_payload(payload, lead)
          cp = lead.linked_company_profile || lead.linked_user&.company_profile
          user = lead.linked_user || cp&.company_users&.where(role: :company)&.order(:id)&.first || cp&.user
          return unless cp

          payload[:linked_metrics] = CompanyMetrics.for_company_profile(cp)
          payload[:recent_jobs] = cp.jobs.order(created_at: :desc).limit(25).map do |j|
            {
              id: j.id,
              title: j.title,
              status: j.status,
              location: j.location,
              created_at: j.created_at,
              finished_at: j.finished_at
            }
          end
          payload[:activity] = {
            feedback_submissions_count: FeedbackSubmission.where(user_id: user.id).count,
            conversations_count: cp.conversations.count,
            messages_count: cp.messages.count
          }
        end

        def normalize_import_row(raw_row)
          row = raw_row.respond_to?(:to_unsafe_h) ? raw_row.to_unsafe_h : raw_row
          row = row.respond_to?(:to_h) ? row.to_h : {}
          normalized = row.transform_keys(&:to_s)

          allowed = %w[
            name contact_name email phone website street_address city state zip instagram_url facebook_url linkedin_url
            status notes linked_user_id linked_company_profile_id company_types contacts
          ]
          payload = normalized.slice(*allowed).symbolize_keys

          payload[:status] = payload[:status].presence || "lead"
          payload[:company_types] =
            case payload[:company_types]
            when String
              payload[:company_types].split(/[,|;]/).map(&:strip).reject(&:blank?)
            when Array
              payload[:company_types].map(&:to_s).map(&:strip).reject(&:blank?)
            else
              []
            end
          payload[:linked_user_id] = payload[:linked_user_id].presence
          payload[:linked_company_profile_id] = payload[:linked_company_profile_id].presence
          payload[:contacts] = normalize_contacts_payload(payload[:contacts], payload)
          payload
        end

        def consolidate_import_rows(rows)
          grouped = {}

          rows.each_with_index do |raw_row, idx|
            row = normalize_import_row(raw_row)
            key = import_company_key(row)
            grouped[key] ||= { rows: [], row_numbers: [] }
            grouped[key][:rows] << row
            grouped[key][:row_numbers] << (idx + 1)
          end

          grouped.values.map do |group|
            merged = merge_import_company_rows(group[:rows], group[:row_numbers])
            { row: merged, row_numbers: group[:row_numbers] }
          end
        end

        def import_company_key(row)
          name_key = row[:name].to_s.strip.downcase
          website_key = row[:website].to_s.strip.downcase.gsub(%r{\Ahttps?://}, "").gsub(%r{\Awww\.}, "").chomp("/")
          website_key.present? ? "#{name_key}|#{website_key}" : name_key
        end

        def merge_import_company_rows(company_rows, row_numbers)
          merged = company_rows.first.dup
          company_rows.drop(1).each do |row|
            %i[
              name contact_name email phone website street_address city state zip instagram_url facebook_url linkedin_url
              status notes linked_user_id linked_company_profile_id
            ].each do |field|
              merged[field] = row[field] if merged[field].blank? && row[field].present?
            end
            merged[:company_types] = Array(merged[:company_types]) | Array(row[:company_types])
          end

          merged = apply_contacts_from_company_rows(merged, company_rows)
          merged
        end

        def apply_contacts_from_company_rows(merged_row, company_rows)
          contacts = company_rows.flat_map do |row|
            from_contacts = Array(row[:contacts]).filter_map do |entry|
              hash = entry.respond_to?(:to_h) ? entry.to_h : {}
              name = hash["name"].to_s.strip.presence || hash[:name].to_s.strip.presence
              email = hash["email"].to_s.strip.presence || hash[:email].to_s.strip.presence
              phone = hash["phone"].to_s.strip.presence || hash[:phone].to_s.strip.presence
              next if name.blank? && email.blank? && phone.blank?

              { name: name, email: email, phone: phone }.compact
            end
            next from_contacts if from_contacts.any?

            name = row[:contact_name].to_s.strip
            email = row[:email].to_s.strip
            phone = row[:phone].to_s.strip
            next [] if name.blank? && email.blank? && phone.blank?

            [{ name: name, email: email, phone: phone }]
          end

          primary_contact = contacts.first
          if primary_contact
            merged_row[:contact_name] = primary_contact[:name].presence || merged_row[:contact_name]
            merged_row[:email] = primary_contact[:email].presence || merged_row[:email]
            merged_row[:phone] = primary_contact[:phone].presence || merged_row[:phone]
          end
          merged_row[:contacts] = contacts
          merged_row
        end

        def normalize_contacts_payload(raw_contacts, row_payload)
          contacts =
            case raw_contacts
            when String
              begin
                JSON.parse(raw_contacts)
              rescue JSON::ParserError
                []
              end
            when Array
              raw_contacts
            else
              []
            end

          normalized = contacts.filter_map do |entry|
            hash = entry.respond_to?(:to_h) ? entry.to_h : {}
            name = hash["name"].to_s.strip.presence || hash[:name].to_s.strip.presence
            email = hash["email"].to_s.strip.presence || hash[:email].to_s.strip.presence
            phone = hash["phone"].to_s.strip.presence || hash[:phone].to_s.strip.presence
            next if name.blank? && email.blank? && phone.blank?

            { name: name, email: email, phone: phone }.compact
          end

          if normalized.empty?
            fallback = {
              name: row_payload[:contact_name].to_s.strip.presence,
              email: row_payload[:email].to_s.strip.presence,
              phone: row_payload[:phone].to_s.strip.presence
            }.compact
            normalized = [fallback] if fallback.present?
          end

          primary = normalized.first
          if primary
            row_payload[:contact_name] = primary[:name].presence || row_payload[:contact_name]
            row_payload[:email] = primary[:email].presence || row_payload[:email]
            row_payload[:phone] = primary[:phone].presence || row_payload[:phone]
          end
          normalized
        end
      end
    end
  end
end
