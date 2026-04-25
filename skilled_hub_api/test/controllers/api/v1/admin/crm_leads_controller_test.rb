require "test_helper"

module Api
  module V1
    module Admin
      class CrmLeadsControllerTest < ActionDispatch::IntegrationTest
        include AuthTestHelper

        test "imports crm leads from rows payload" do
          admin = User.create!(
            email: "admin+crm_import_test@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin
          )

          post "/api/v1/admin/crm_leads/import",
               params: {
                 rows: [
                   {
                     name: "Alpha Air",
                     contact_name: "Morgan Reed",
                     email: "morgan@alphaair.com",
                     phone: "555-100-2000",
                     website: "https://alphaair.com",
                     company_types: "hvac|electrical",
                     status: "lead",
                     notes: "Import test row"
                   },
                   {
                     name: "Broken Row Co",
                     status: "not-a-status"
                   }
                 ]
               },
               headers: auth_header_for(admin),
               as: :json

          assert_response :ok
          body = JSON.parse(response.body)
          assert_equal 1, body.fetch("imported_count")
          assert_equal 1, body.fetch("failed_count")
          assert_equal 1, body.fetch("errors").length
          created = CrmLead.find_by!(name: "Alpha Air")
          assert_equal %w[electrical hvac], created.company_types.sort
          assert_equal 1, created.contacts.length
          assert_equal "Morgan Reed", created.contacts.first["name"]
        end

        test "consolidates same-company rows into one crm lead with additional contacts" do
          admin = User.create!(
            email: "admin+crm_import_merge_test@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin
          )

          post "/api/v1/admin/crm_leads/import",
               params: {
                 rows: [
                   {
                     name: "Northwind Mechanical",
                     contact_name: "Alex Johnson",
                     email: "alex@northwind.com",
                     phone: "555-111-2222",
                     website: "https://northwind.com",
                     company_types: "hvac",
                     status: "lead",
                     notes: "Primary import row"
                   },
                   {
                     name: "Northwind Mechanical",
                     contact_name: "Jamie Carter",
                     email: "jamie@northwind.com",
                     phone: "555-333-4444",
                     website: "northwind.com",
                     company_types: "electrical",
                     status: "lead",
                     notes: "Secondary row"
                   }
                 ]
               },
               headers: auth_header_for(admin),
               as: :json

          assert_response :ok
          body = JSON.parse(response.body)
          assert_equal 1, body.fetch("imported_count")
          assert_equal 0, body.fetch("failed_count")

          lead = CrmLead.find_by!(name: "Northwind Mechanical")
          assert_equal "Alex Johnson", lead.contact_name
          assert_equal "alex@northwind.com", lead.email
          assert_equal %w[electrical hvac], lead.company_types.sort
          assert_equal 2, lead.contacts.length
          assert_equal "Jamie Carter", lead.contacts.second["name"]
          assert_equal "jamie@northwind.com", lead.contacts.second["email"]
        end

        test "bulk destroys crm leads by ids" do
          admin = User.create!(
            email: "admin+crm_bulk_delete_test@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: :admin
          )

          keep = CrmLead.create!(name: "Keep Co", status: "lead")
          remove_a = CrmLead.create!(name: "Remove A", status: "lead")
          remove_b = CrmLead.create!(name: "Remove B", status: "lead")

          post "/api/v1/admin/crm_leads/bulk_destroy",
               params: { ids: [remove_a.id, remove_b.id, 999_999] },
               headers: auth_header_for(admin),
               as: :json

          assert_response :ok
          body = JSON.parse(response.body)
          assert_equal 2, body.fetch("deleted_count")
          assert_equal 3, body.fetch("requested_count")
          assert_equal [999_999], body.fetch("not_found_ids")
          assert CrmLead.exists?(keep.id)
          assert_not CrmLead.exists?(remove_a.id)
          assert_not CrmLead.exists?(remove_b.id)
        end
      end
    end
  end
end
