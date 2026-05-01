# Clear old data — order matters when foreign keys are enabled (SQLite).
# Clear users.company_profile_id before deleting company_profiles (FK users -> company_profiles).
Message.delete_all
Conversation.delete_all
JobIssueReport.delete_all
Rating.delete_all
Payment.delete_all
JobApplication.delete_all
JobCounterOffer.where.not(parent_offer_id: nil).delete_all
JobCounterOffer.delete_all
SavedJobSearch.delete_all
FavoriteTechnician.delete_all
Document.delete_all
ReferralSubmission.delete_all
CrmNote.where.not(parent_note_id: nil).delete_all
CrmNote.delete_all
CrmLead.delete_all
Job.delete_all
FeedbackSubmission.delete_all
UserLoginEvent.delete_all
User.update_all(company_profile_id: nil)
CompanyProfile.delete_all
TechnicianProfile.delete_all
User.delete_all

# Users (password: Falcon23$! for all)
tech1 = User.create!(email: "ethanfree23+tech1@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :technician)
tech2 = User.create!(email: "ethanfree23+tech2@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :technician)
company1 = User.create!(email: "ethanfree23+company1@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :company)
company2 = User.create!(email: "ethanfree23+company2@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :company)
admin_user = User.create!(email: "ethanfree23+admin@gmail.com", password: "Falcon23$!", password_confirmation: "Falcon23$!", role: :admin)

# Profiles — tech1 is premium + Houston coords so dashboard map + membership delays match local dev (basic tier waits 48h after go-live per tier config).
hou_lat = BigDecimal("29.7604")
hou_lng = BigDecimal("-95.3698")

tech1_profile = TechnicianProfile.create!(
  user: tech1,
  trade_type: "Plumber",
  experience_years: 4,
  availability: "Weekdays",
  location: "Houston, TX",
  membership_level: "premium",
  address: "1200 Smith St",
  city: "Houston",
  state: "TX",
  zip_code: "77002",
  country: "United States",
  bio: "Seeded demo technician",
  phone: "555-0100"
)
tech1_profile.update_columns(latitude: hou_lat, longitude: hou_lng)

TechnicianProfile.create!(user: tech2, trade_type: "HVAC", experience_years: 6, availability: "Full-time", location: "Austin")
cp1 = CompanyProfile.create!(user: company1, company_name: "FixIt Inc", industry: "Construction", location: "Austin")
cp2 = CompanyProfile.create!(user: company2, company_name: "BuildRight Co", industry: "Commercial", location: "Dallas")

# Open jobs at distinct Houston-metro coordinates (so distances from tech1 are not all 0.0 mi).
# Tech home: downtown ~29.7604,-95.3698 — jobs placed a few–15+ miles away for realistic listings.
seed_open_jobs = [
  ["Emergency pipe repair", cp1, BigDecimal("29.7174"), BigDecimal("-95.4178")],      # southwest ~5 mi
  ["Commercial HVAC inspection", cp1, BigDecimal("29.7489"), BigDecimal("-95.2594")], # east ~6–7 mi
  ["Residential electrical panel", cp2, BigDecimal("29.8026"), BigDecimal("-95.5089")] # northwest ~8 mi
]

seed_open_jobs.each do |(title, company, job_lat, job_lng)|
  job = Job.create!(
    company_profile: company,
    title: title,
    description: "Seeded open job for local development.",
    status: :open,
    city: "Houston",
    state: "TX",
    country: "United States",
    hourly_rate_cents: 7500,
    hours_per_day: 8,
    days: 1,
    scheduled_end_at: 14.days.from_now,
    minimum_years_experience: 0
  )
  job.update_columns(
    latitude: job_lat,
    longitude: job_lng,
    go_live_at: 72.hours.ago
  )
end
