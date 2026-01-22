# Environment Setup — Artemis E2E (Replit)

This doc standardizes the environment variables across the ecosystem so the E2E demo is predictable.

---

## Where to set env vars in Replit (click-by-click)

For each Replit project (Hunt, Gate, Arise):
1. Open the project in Replit
2. Click **Secrets** (lock icon 🔒)
3. Click **New Secret**
4. Add **Key** and **Value**
5. Repeat for all required keys
6. Restart the Repl (stop ▶ / run ▶)

---

## Shared conventions (recommended)

- Prefer URLs with `https://` (Replit deployment URL)
- Keep names consistent across repos

---

## Hunt (Field App) — required env vars

Set in **Hunt Replit → Secrets**:

- `ARISE_API_URL`
  - Example: `https://<your-arise-repl>.replit.app`
  - Used to submit proposals and fetch statuses

Optional (if used in your codebase):
- `APP_ENV` = `dev` or `prod`

---

## Gate (Backoffice) — required env vars

Set in **Gate Replit → Secrets**:

- `ARISE_API_URL`
  - Example: `https://<your-arise-repl>.replit.app`
  - Used to load inbox and submit decisions

Optional:
- `APP_ENV` = `dev` or `prod`

---

## Arise (Backend/API) — required env vars

Set in **Arise Replit → Secrets**:

- `SESSION_SECRET`
  - Any long random string (keep private)

If your backend uses DB persistence (only if applicable):
- `DATABASE_URL`
  - The DB connection string you’re using in that Repl

Optional:
- `APP_ENV` = `dev` or `prod`

---

## Quick validation (what to check)

In each Repl **Shell**:

- Confirm the app boots:
  - No crash loop in console
- Confirm the frontend points to Arise:
  - Hunt can submit without 500 errors
  - Gate can load inbox without CORS errors

If a request fails, inspect the request URL — it’s almost always `ARISE_API_URL` mismatch.
