# Clear old data
Message.delete_all
Conversation.delete_all
Rating.delete_all
Document.delete_all
JobApplication.delete_all
Job.delete_all
CompanyProfile.delete_all
TechnicianProfile.delete_all
User.delete_all

# Users (password: password123 for both)
tech_user = User.create!(email: "tech@example.com", password: "password123", password_confirmation: "password123", role: :technician)
company_user = User.create!(email: "company@example.com", password: "password123", password_confirmation: "password123", role: :company)

# Profiles
tp = TechnicianProfile.create!(user: tech_user, trade_type: "Plumber", experience_years: 4, availability: "Weekdays")
cp = CompanyProfile.create!(user: company_user, company_name: "FixIt Inc", industry: "Construction", location: "Austin")

# Job
job = Job.create!(
  company_profile: cp,
  title: "HVAC Repair",
  description: "Urgent fix needed",
  required_documents: "EPA Cert",
  location: "Austin",
  status: :open
)

# Job Application
app = JobApplication.create!(
  job: job,
  technician_profile: tp,
  status: :requested,
  notes: "I'm available tomorrow"
)

# Conversation
conv = Conversation.create!(
  job: job,
  technician_profile: tp,
  company_profile: cp
)

# Message
msg = Message.create!(
  conversation: conv,
  sender: tech_user,
  content: "Looking forward to the job!"
)

# Document
doc = Document.create!(
  uploadable: tp,
  doc_type: "License"
)

# Rating
rating = Rating.create!(
  job: job,
  reviewer: company_user,
  reviewee: tech_user,
  score: 5,
  comment: "Excellent work!"
)
