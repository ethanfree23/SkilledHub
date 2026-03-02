# Quick Wins – First-Come-First-Serve Flow

Updated for the Uber-style claim model (technician claims job → immediate match, no company approval).

---

## ✅ All Complete

| # | Task | Status |
|---|------|--------|
| 1 | **Route fix** – `/jobs/:id` renders `JobDetail` instead of `ViewJob` | Done |
| 2 | **Claim flow** – "Claim Job" button (single click, no form) in JobList and JobDetail | Done |
| 3 | **Job completion** – "Mark Complete" in CompanyDashboard and JobDetail for claimed jobs | Done |
| 4 | **Remove debug UI** – Debug block removed from JobList | Done |
| 5 | **Ratings API** – `create` in RatingsController + `ratingsAPI` in frontend | Done |
| 6 | **Review UI** – "Leave a review" form in JobDetail when job is finished | Done |
| 7 | **Cleanup** – Removed unused `ViewJob.jsx` | Done |

---

## Flow Summary

1. **Company** posts job → status `open`
2. **Technician** sees job, clicks "Claim Job" → job is theirs immediately (status `reserved`)
3. **Company** sees who claimed it via "View Claimed By"
4. **Company** clicks "Mark Complete" when work is done → status `finished`
5. **Both parties** leave reviews (company reviews technician, technician reviews company)
