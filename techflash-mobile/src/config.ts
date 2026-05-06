const DEFAULT_API =
  'https://skilledhub-production.up.railway.app/api/v1';

/** Set `EXPO_PUBLIC_API_BASE_URL` in `.env` for local API during development. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API;
