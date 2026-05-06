# TechFlash Mobile Device QA Runbook

Use this to validate parity quickly on a real phone (Expo build/dev client).

## 0) Pre-flight (2 minutes)

- [ ] API is reachable from device (`EXPO_PUBLIC_API_BASE_URL` points to live/staging/local LAN endpoint).
- [ ] Start app with tunnel if needed: `npm run start:tunnel`
- [ ] Test accounts exist:
  - [ ] Admin account
  - [ ] Company account
  - [ ] Technician account
- [ ] Seed at least one open job and one conversation-capable scenario.

## 1) Admin pass (5 minutes)

### A. Users list/detail
- [ ] Login as admin.
- [ ] Open `Admin Users` tab.
- [ ] Switch filters: `all`, `company`, `technician`.
- [ ] Confirm grouped sections under `all` (Technicians / Companies).
- [ ] Open one company user detail.
- [ ] Tap `Ensure profile` and confirm success notice.
- [ ] Edit profile fields, save, and confirm refresh.
- [ ] Edit membership pricing fields, save, confirm refresh.

### B. Admin create user
- [ ] Back to users list, tap `Create user`.
- [ ] Create technician (required fields + role-specific fields).
- [ ] Create company (required fields + company fields).
- [ ] Confirm both appear in list/search.

### C. Masquerade and safety
- [ ] Open a user detail and start `Masquerade`.
- [ ] Confirm session switches to target role UI.
- [ ] Log out and log back in as admin (safe return path).

### D. CRM
- [ ] Open `Admin CRM`.
- [ ] Create lead.
- [ ] Edit lead fields and save.
- [ ] Add timeline note.
- [ ] Mark follow-up on a note.

## 2) Company pass (4 minutes)

- [ ] Login as company.
- [ ] Open `Jobs` tab.
- [ ] Create a job.
- [ ] Open created job detail.
- [ ] Edit job fields and save.
- [ ] Use `Extend job` with valid ISO end datetime.
- [ ] Trigger `Deny claim` path (when claim exists).
- [ ] Trigger `Finish job` path (when eligible).
- [ ] Tap `Open conversation` from job detail.

## 3) Technician pass (4 minutes)

- [ ] Login as technician.
- [ ] Open `Jobs` tab and load open jobs.
- [ ] Open job detail, claim job (optional preferred start).
- [ ] Finish an in-progress job.
- [ ] Open `Messages` tab.
- [ ] Open a normal conversation and send message.

## 4) Messaging constraints pass (2 minutes)

- [ ] Login as admin.
- [ ] Open `Messages`.
- [ ] Open a feedback thread.
- [ ] Confirm composer is hidden/disabled (read-only).

## 5) Settings/billing pass (3 minutes)

### A. Company
- [ ] Login as company, go to `More` -> `Open settings`.
- [ ] Update account fields and save.
- [ ] Change membership level:
  - [ ] Basic/non-paid transition updates natively.
  - [ ] Paid transition opens hosted checkout URL.

### B. Technician
- [ ] Login as technician, go to `More` -> `Open settings`.
- [ ] Update account fields and save.
- [ ] Tap `Open payout onboarding`.
- [ ] Confirm Stripe Connect URL opens in browser.

## 6) Session persistence pass (2 minutes)

- [ ] Login as each role once and force close app.
- [ ] Reopen app and verify session token persisted.
- [ ] Logout clears session and returns to auth flow.

---

## Failure capture template

Copy/paste for each failure:

- **Role:** admin/company/technician
- **Flow:** (e.g., Jobs -> Extend)
- **Expected:** ...
- **Actual:** ...
- **Error text/screenshot:** ...
- **API endpoint involved (if known):** ...

## Exit criteria

- [ ] All checklist items pass, or
- [ ] Any failures documented with repro steps + role + screenshot.
