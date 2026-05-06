# TechFlash Mobile

Native Expo app for TechFlash role parity (admin, company, technician).

## Local development

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` when needed.
2. Install dependencies: `npm install`
3. Start Metro:
   - `npm run start:tunnel` (most reliable on mixed networks)
   - or `npm run start:lan`

## Build profiles (EAS)

- `npm run eas:build:dev` - development client build
- `npm run eas:build:preview` - internal preview build
- `npm run eas:build:prod` - production Android build

`eas.json` defines release channels:
- `development`
- `preview`
- `production`

## Environment strategy

- Local dev: LAN URL to your Rails API.
- Staging: set `EXPO_PUBLIC_API_BASE_URL` to staging API endpoint.
- Production: use production API endpoint (or fallback from `src/config.ts`).
- Maps: set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` for native map tiles and address geocoding (see `app.config.js`).

## Settings (web parity)

Open **Account → Settings** from the **More** tab. Tabs mirror the website:

- **Account** — email + password
- **Profile** — company, technician, or admin fields
- **Notifications** — OS push permission + local opt-in (company/technician), email categories + job-alert templates (technician), synced via `PATCH /users/me`
- **Payment** — membership tier, Stripe checkout deep links, company billing link to techflash.app, technician Stripe Connect
- **Admin only** — **System** and **Job access** link to full native admin screens (tier pricing, licensing states, email QA smoke sends; technician tier job-access gates)

## QA checklist (role-based)

See `docs/mobile-qa-matrix.md` for admin/company/technician parity checks and session flows.

Device walkthrough: `docs/device-qa-runbook.md`.
Release gate: `docs/release-readiness-checklist.md`.
Parity tracker: `docs/web-mobile-parity-matrix.md`.
