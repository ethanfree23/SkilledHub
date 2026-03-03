# Test Data Seeds for Filtering, Scoping, and Authorization Testing

puts "Creating test data for filtering, scoping, and authorization tests..."

# Create test users
puts "Creating test users..."

# Technician user (job seeker)
technician_user = User.create!(
  email: 'technician@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  role: :technician
)

# Company user
company_user = User.create!(
  email: 'company@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  role: :company
)

puts "✓ Created technician user: #{technician_user.email}"
puts "✓ Created company user: #{company_user.email}"

# Create profiles
puts "Creating profiles..."

technician_profile = TechnicianProfile.create!(
  user_id: technician_user.id,
  trade_type: 'HVAC Repair',
  experience_years: 5,
  availability: 'Full-time'
)

company_profile = CompanyProfile.create!(
  user_id: company_user.id,
  company_name: 'TechFix Solutions',
  location: 'Austin, TX',
  industry: 'Technology Services'
)

puts "✓ Created technician profile for #{technician_user.email}"
puts "✓ Created company profile for #{company_user.email}"

# Create test jobs with different locations and statuses
puts "Creating test jobs..."

jobs = [
  {
    title: 'HVAC Repair Technician Needed',
    description: 'Looking for experienced HVAC repair technician for residential and commercial work',
    location: 'Austin, TX',
    status: 0, # open
    company_profile_id: company_profile.id
  },
  {
    title: 'Plumbing Repair Specialist',
    description: 'Urgent need for plumbing repair specialist in downtown area',
    location: 'Austin, TX',
    status: 0, # open
    company_profile_id: company_profile.id
  },
  {
    title: 'Electrical Repair Technician',
    description: 'Experienced electrical repair technician needed for industrial work',
    location: 'Dallas, TX',
    status: 0, # open
    company_profile_id: company_profile.id
  },
  {
    title: 'Appliance Repair Technician',
    description: 'Looking for appliance repair specialist for home appliance repairs',
    location: 'Houston, TX',
    status: 1, # closed
    company_profile_id: company_profile.id
  },
  {
    title: 'Computer Repair Technician',
    description: 'Computer repair and maintenance technician needed for office environment',
    location: 'Austin, TX',
    status: 0, # open
    company_profile_id: company_profile.id
  }
]

created_jobs = []
jobs.each do |job_attrs|
  job = Job.create!(job_attrs)
  created_jobs << job
  puts "✓ Created job: #{job.title} (#{job.location}, #{job.status})"
end

# Create job applications
puts "Creating job applications..."

# Technician applies to some jobs
job_application_data = [
  {
    job: created_jobs[0], # HVAC Repair in Austin
    technician_profile: technician_profile,
    status: 0 # pending
  },
  {
    job: created_jobs[1], # Plumbing Repair in Austin
    technician_profile: technician_profile,
    status: 1 # accepted
  },
  {
    job: created_jobs[2], # Electrical Repair in Dallas
    technician_profile: technician_profile,
    status: 2 # rejected
  }
]

created_job_applications = []
job_application_data.each do |app_attrs|
  application = JobApplication.create!(app_attrs)
  created_job_applications << application
  puts "✓ Created job application: #{application.job.title} (#{application.status})"
end

# Create test documents
puts "Creating test documents..."

# Create a test file for document uploads
test_file_content = "This is a test document for #{technician_user.email}"
File.write('test_resume.txt', test_file_content)

# Create documents for different entities
puts "Creating document for TechnicianProfile..."
document1 = Document.create!(
  uploadable_id: technician_profile.id,
  uploadable_type: 'TechnicianProfile'
)
File.open('test_resume.txt') do |file|
  document1.file.attach(
    io: file,
    filename: "technician_resume.txt",
    content_type: 'text/plain'
  )
end
puts "✓ Created document for TechnicianProfile: #{document1.id}"

puts "Creating document for CompanyProfile..."
document2 = Document.create!(
  uploadable_id: company_profile.id,
  uploadable_type: 'CompanyProfile'
)
File.open('test_resume.txt') do |file|
  document2.file.attach(
    io: file,
    filename: "company_document.txt",
    content_type: 'text/plain'
  )
end
puts "✓ Created document for CompanyProfile: #{document2.id}"

puts "Creating document for Job..."
document3 = Document.create!(
  uploadable_id: created_jobs[0].id,
  uploadable_type: 'Job'
)
File.open('test_resume.txt') do |file|
  document3.file.attach(
    io: file,
    filename: "job_document.txt",
    content_type: 'text/plain'
  )
end
puts "✓ Created document for Job: #{document3.id}"

puts "Creating document for JobApplication..."
document4 = Document.create!(
  uploadable_id: created_job_applications[0].id,
  uploadable_type: 'JobApplication'
)
File.open('test_resume.txt') do |file|
  document4.file.attach(
    io: file,
    filename: "application_document.txt",
    content_type: 'text/plain'
  )
end
puts "✓ Created document for JobApplication: #{document4.id}"

# Clean up test file
File.delete('test_resume.txt') if File.exist?('test_resume.txt')

puts "\nTest data creation complete!"
puts "============================="
puts "Technician user: #{technician_user.email} (password: password123)"
puts "Company user: #{company_user.email} (password: password123)"
puts "Created #{created_jobs.length} jobs with different locations and statuses"
puts "Created #{created_job_applications.length} job applications"
puts "Created 4 test documents"

puts "\nYou can now test:"
puts "1. Job filtering by location, status, and keyword"
puts "2. Job application scoping for different user roles"
puts "3. Document access control"
puts "4. Authorization rules"

puts "\nUse the test_filtering_scoping.rb script for curl commands to test these features." 