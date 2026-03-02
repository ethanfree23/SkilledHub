#!/usr/bin/env ruby

# Filtering, Scoping, and Authorization Test Script
puts "Filtering, Scoping, and Authorization Test"
puts "=========================================="

puts "\n1. Job Filtering Tests"
puts "======================"

puts "\nTest job filtering by location:"
puts "curl -X GET 'http://localhost:3000/api/v1/jobs?location=Austin' \\"
puts "  -H 'Authorization: Bearer YOUR_TOKEN'"

puts "\nTest job filtering by status:"
puts "curl -X GET 'http://localhost:3000/api/v1/jobs?status=open' \\"
puts "  -H 'Authorization: Bearer YOUR_TOKEN'"

puts "\nTest job filtering by keyword:"
puts "curl -X GET 'http://localhost:3000/api/v1/jobs?query=repair' \\"
puts "  -H 'Authorization: Bearer YOUR_TOKEN'"

puts "\nTest combined filters:"
puts "curl -X GET 'http://localhost:3000/api/v1/jobs?location=Austin&status=open&query=repair' \\"
puts "  -H 'Authorization: Bearer YOUR_TOKEN'"

puts "\n2. Job Application Scoping Tests"
puts "================================="

puts "\nTest job seeker viewing their own applications:"
puts "curl -X GET 'http://localhost:3000/api/v1/job_applications' \\"
puts "  -H 'Authorization: Bearer TECHNICIAN_TOKEN'"

puts "\nTest company viewing applications for their jobs:"
puts "curl -X GET 'http://localhost:3000/api/v1/job_applications' \\"
puts "  -H 'Authorization: Bearer COMPANY_TOKEN'"

puts "\nTest company viewing applications for specific job:"
puts "curl -X GET 'http://localhost:3000/api/v1/job_applications?job_id=1' \\"
puts "  -H 'Authorization: Bearer COMPANY_TOKEN'"

puts "\n3. Document Access Control Tests"
puts "================================="

puts "\nTest technician viewing their own documents:"
puts "curl -X GET 'http://localhost:3000/api/v1/documents' \\"
puts "  -H 'Authorization: Bearer TECHNICIAN_TOKEN'"

puts "\nTest company viewing their documents:"
puts "curl -X GET 'http://localhost:3000/api/v1/documents' \\"
puts "  -H 'Authorization: Bearer COMPANY_TOKEN'"

puts "\nTest accessing specific document (should fail if unauthorized):"
puts "curl -X GET 'http://localhost:3000/api/v1/documents/1' \\"
puts "  -H 'Authorization: Bearer YOUR_TOKEN'"

puts "\n4. Authorization Tests"
puts "======================"

puts "\nTest unauthorized access to job applications:"
puts "curl -X GET 'http://localhost:3000/api/v1/job_applications' \\"
puts "  -H 'Authorization: Bearer WRONG_ROLE_TOKEN'"

puts "\nTest unauthorized access to documents:"
puts "curl -X GET 'http://localhost:3000/api/v1/documents/1' \\"
puts "  -H 'Authorization: Bearer UNAUTHORIZED_TOKEN'"

puts "\nTest company trying to create job application (should fail):"
puts "curl -X POST 'http://localhost:3000/api/v1/job_applications' \\"
puts "  -H 'Authorization: Bearer COMPANY_TOKEN' \\"
puts "  -H 'Content-Type: application/json' \\"
puts "  -d '{\"job_id\":1}'"

puts "\nTest technician trying to create job (should fail):"
puts "curl -X POST 'http://localhost:3000/api/v1/jobs' \\"
puts "  -H 'Authorization: Bearer TECHNICIAN_TOKEN' \\"
puts "  -H 'Content-Type: application/json' \\"
puts "  -d '{\"title\":\"Test Job\"}'"

puts "\n5. Expected Results"
puts "==================="

puts "\nJob Filtering:"
puts "✓ location=Austin - Returns only jobs in Austin"
puts "✓ status=open - Returns only open jobs"
puts "✓ query=repair - Returns jobs with 'repair' in title or description"
puts "✓ Combined filters - Returns jobs matching all criteria"

puts "\nJob Application Scoping:"
puts "✓ Technician - Only sees their own applications"
puts "✓ Company - Sees applications for their jobs"
puts "✓ Company with job_id - Sees applications for specific job"
puts "✓ Unauthorized access - Returns 403 Forbidden"

puts "\nDocument Access Control:"
puts "✓ Technician - Sees their own documents and job-related documents"
puts "✓ Company - Sees their documents and job application documents"
puts "✓ Cross-access - Returns 403 Forbidden for unauthorized documents"

puts "\nAuthorization:"
puts "✓ 401 Unauthorized - Invalid or missing token"
puts "✓ 403 Forbidden - Valid token but wrong role"
puts "✓ 200/201 Success - Valid token and correct role"

puts "\n6. Sample Test Data Setup"
puts "========================="

puts "\nCreate test users:"
puts "1. Technician user (job seeker)"
puts "2. Company user"
puts "3. Create test jobs with different locations and statuses"
puts "4. Create job applications"
puts "5. Upload test documents"

puts "\n7. Testing Commands"
puts "==================="

puts "\n# First, create test users and get tokens:"
puts "curl -X POST http://localhost:3000/api/v1/sessions \\"
puts "  -H 'Content-Type: application/json' \\"
puts "  -d '{\"email\":\"technician@example.com\",\"password\":\"password\"}'"

puts "\ncurl -X POST http://localhost:3000/api/v1/sessions \\"
puts "  -H 'Content-Type: application/json' \\"
puts "  -d '{\"email\":\"company@example.com\",\"password\":\"password\"}'"

puts "\n# Then test the filtering and scoping features with the returned tokens" 