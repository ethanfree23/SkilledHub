# Screenshot Parity Sign-Off Checklist

Use this to lock visual parity between web and mobile after the latest dashboard/settings/job-detail updates.

## Capture Rules

- Use the same user account and dataset on both web and mobile.
- Capture web at a narrow responsive width close to phone portrait.
- Capture mobile in portrait mode, default text scaling.
- Compare against the criteria below; mark PASS/FAIL.

---

## 1) Technician Home (Map + Open Jobs)

### Screenshots
- Web: Technician dashboard with map and open jobs list visible.
- Mobile: `Dashboard` as technician, same data/time.

### Pass Criteria
- Map appears at top, list appears below.
- Open jobs visible in list also appear as map markers.
- Initial map center is near device GPS (or profile fallback when GPS unavailable).
- Section title styling and card spacing are visually consistent.

---

## 2) Company Home (Snapshot + My Jobs)

### Screenshots
- Web: Company dashboard overview.
- Mobile: `Dashboard` as company.

### Pass Criteria
- Snapshot metrics are visible and readable (in progress / open / completed equivalents).
- "My Jobs" summary card is present with clear total.
- Card density and typography scale feel aligned to web hierarchy.

---

## 3) Job Detail (Company/Admin + Technician)

### Screenshots
- Web: Job detail for a live/open job.
- Mobile: `JobDetail` for same job as company/admin and technician.

### Pass Criteria
- Core metadata sections exist: status, location, company/industry, schedule.
- Timeline/payment/description/notes blocks are readable and separated.
- Action blocks are grouped cleanly (tech actions vs company/admin actions).
- Text hierarchy (title, labels, body, captions) is consistent.

---

## 4) Settings: Notifications + Alert Template

### Screenshots
- Web: Settings notification/alerts tab.
- Mobile: `Settings` -> Notifications panel as technician.

### Pass Criteria
- Field order is: tags -> distance -> pay range -> duration range.
- No location input appears in alert-template form.
- "Map center for alerts" helper is visible and understandable.
- Toggle rows and helper text spacing match design rhythm.

---

## 5) Settings: Profile Phone Formatting

### Screenshots
- Mobile only evidence is acceptable for this check.
- Capture before/after typing a 10-digit phone in:
  - Register
  - Admin Create User
  - Settings Profile

### Pass Criteria
- Input auto-formats as `(xxx) xxx-xxxx`.
- No visual overflow or clipping in fields.
- Save/submit flows succeed with no UI error.

---

## Final Sign-Off

Mark each section:

- [ ] Technician Home
- [ ] Company Home
- [ ] Job Detail
- [ ] Notifications + Alert Template
- [ ] Phone Formatting

Release visual parity sign-off is complete when all are checked PASS.
