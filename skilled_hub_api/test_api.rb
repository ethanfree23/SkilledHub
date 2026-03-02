#!/usr/bin/env ruby

# Simple API test script
puts "API Endpoints Test"
puts "=================="

# Test public endpoints (no authentication required)
puts "\n1. Testing public endpoints:"
puts "   GET /api/v1/users - List all users"
puts "   GET /api/v1/jobs - List all jobs"

# Test authenticated endpoints
puts "\n2. Testing authenticated endpoints (require JWT token):"
puts "   GET /api/v1/users/:id - Show specific user"
puts "   GET /api/v1/jobs/:id - Show specific job"
puts "   GET /api/v1/job_applications - List job applications"
puts "   GET /api/v1/job_applications/:id - Show specific job application"
puts "   GET /api/v1/conversations - List conversations"
puts "   GET /api/v1/conversations/:id - Show specific conversation"
puts "   GET /api/v1/messages - List messages"
puts "   GET /api/v1/messages/:id - Show specific message"
puts "   GET /api/v1/documents - List documents"
puts "   GET /api/v1/documents/:id - Show specific document"
puts "   GET /api/v1/ratings - List ratings"
puts "   GET /api/v1/ratings/:id - Show specific rating"
puts "   GET /api/v1/auth - Check authentication status"

# Test authentication endpoint
puts "\n3. Authentication endpoint:"
puts "   POST /api/v1/sessions - Login (email, password)"

puts "\nTo test these endpoints:"
puts "1. Start the Rails server: bundle exec rails server"
puts "2. Use curl or Postman to make requests"
puts "3. For authenticated endpoints, include the JWT token in the Authorization header:"
puts "   Authorization: Bearer <your_jwt_token>"

puts "\nExample curl commands:"
puts "curl -X GET http://localhost:3000/api/v1/users"
puts "curl -X GET http://localhost:3000/api/v1/jobs"
puts "curl -X POST http://localhost:3000/api/v1/sessions -H 'Content-Type: application/json' -d '{\"email\":\"user@example.com\",\"password\":\"password\"}'"
puts "curl -X GET http://localhost:3000/api/v1/users/1 -H 'Authorization: Bearer <your_jwt_token>'" 