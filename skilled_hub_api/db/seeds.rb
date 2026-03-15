# Clear old data
Message.delete_all
Conversation.delete_all
Rating.delete_all
Document.delete_all
JobApplication.delete_all
Payment.delete_all
Job.delete_all
CompanyProfile.delete_all
TechnicianProfile.delete_all
User.delete_all

# Users (password: Falcon23$! for all)
tech1 = User.create!(email: "ethanfree23+tech1@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :technician)
tech2 = User.create!(email: "ethanfree23+tech2@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :technician)
company1 = User.create!(email: "ethanfree23+company1@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :company)
company2 = User.create!(email: "ethanfree23+company2@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :company)
admin_user = User.create!(email: "ethanfree23+admin@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :admin)

# Profiles
TechnicianProfile.create!(user: tech1, trade_type: "Plumber", experience_years: 4, availability: "Weekdays", location: "Austin")
TechnicianProfile.create!(user: tech2, trade_type: "HVAC", experience_years: 6, availability: "Full-time", location: "Austin")
cp1 = CompanyProfile.create!(user: company1, company_name: "FixIt Inc", industry: "Construction", location: "Austin")
cp2 = CompanyProfile.create!(user: company2, company_name: "BuildRight Co", industry: "Commercial", location: "Dallas")

