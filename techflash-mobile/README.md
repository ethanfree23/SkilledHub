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

## QA checklist (role-based)

See `docs/mobile-qa-matrix.md` for admin/company/technician parity checks and session flows.
