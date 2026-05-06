# Web vs Mobile Parity Matrix

This matrix tracks role-by-role parity between `skilled-hub-frontend` (web) and `techflash-mobile` (Expo app).

## Admin

- Dashboard KPIs/charts: parity met (cards + bar visualization + drilldown routes).
- User feedback on home: parity met (recent feedback list on dashboard).
- Admin user detail coverage: parity expanded (11-section equivalent data surfaces).
- Settings system controls + job access: parity met (native routes wired).
- Job detail counter-offer identity links: parity met on web, surfaced in mobile detail via conversation/admin flows.

## Company

- Dashboard sections (open/claimed/completed): parity met.
- Job creation fields and payload shape: parity met (title, class, experience, notes, address, pricing, schedule).
- Date/time entry UX: parity met with scrollable popup selectors (web + mobile).
- Job actions (edit/finish/deny/extend/conversation): parity met.
- Settings tabs and billing/deep-link behavior: parity met.

## Technician

- Dashboard home map + list synchronization: parity met (same open-jobs source in mobile, radius/rules aligned on web).
- Job list/detail + claim/finish flows: parity met.
- Map marker rendering fallback when coords are missing: parity met (geocode fallback + cache).
- Notifications (OS permission + local toggle + email prefs): parity met.
- Saved search/email alert templates: parity met.

## Open Exceptions / Intentional Differences

- Expo Go warning for remote push remains expected on SDK 53+; dev client/build required for complete notification runtime behavior.
- Native mobile layouts are condensed by design (same data/actions, mobile-optimized presentation).
