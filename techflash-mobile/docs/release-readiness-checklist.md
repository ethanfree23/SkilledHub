# Release Readiness Checklist

## Build and Type Safety

- [ ] `npx tsc --noEmit` passes in `techflash-mobile`.
- [ ] `npm run -s build` passes in `skilled-hub-frontend`.
- [ ] No new lint diagnostics in recently changed files.

## Parity Validation

- [ ] `docs/web-mobile-parity-matrix.md` reviewed and current.
- [ ] Admin/company/technician core flows validated on mobile and web.
- [ ] Company create-job payload fields match web behavior.
- [ ] Technician dashboard map/list parity confirmed.

## Runtime and Stability

- [ ] No React key warnings in terminal logs.
- [ ] Map loads without global-earth zoom regression.
- [ ] Notification permission flow works on device.
- [ ] Expo Go limitations acknowledged (use dev build for full notifications runtime).

## High-Risk Smoke Pass

- [ ] Admin: dashboard, user detail, system controls, job access, feedback.
- [ ] Company: create job, edit job, finish/deny/extend, message flow.
- [ ] Technician: map/list dashboard, claim/finish job, messaging, settings.

## Rollout Notes

- [ ] Confirm API base URL and Maps key env values for target environment.
- [ ] Capture screenshots for any unresolved differences before release.
- [ ] Publish known issues and rollback owner in release notes.
