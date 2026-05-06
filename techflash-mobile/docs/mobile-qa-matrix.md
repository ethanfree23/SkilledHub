# Mobile QA Matrix

## Admin

- [ ] Admin users list loads and filters by all/company/technician
- [ ] Admin user detail loads, profile save works, membership pricing saves
- [ ] Admin can create company and technician users
- [ ] CRM leads list/detail/create/update/notes works

## Company

- [ ] Company can create a job
- [ ] Company can edit job and extend end date
- [ ] Company can deny/finish job when eligible
- [ ] Company can open job conversation

## Technician

- [ ] Technician sees jobs list and can claim eligible job
- [ ] Technician can finish active job
- [ ] Technician can open and send in non-feedback conversations
- [ ] Technician can open payout onboarding deep-link

## Messaging constraints

- [ ] Admin feedback threads appear in inbox
- [ ] Feedback thread composer is disabled (read-only)

## Session flows

- [ ] Login persists across app restart
- [ ] Logout clears local token/session
- [ ] Admin masquerade enters target user session
- [ ] Masqueraded session can safely logout/re-auth back to admin

## Completed checks in this sprint

- [x] TypeScript compile pass (`npm run typecheck`)
