# Artemis Hub — Environment Setup

This document describes the required environment variables (Replit Secrets) for `artemis-hub`.

## 1) Where to set variables

In Replit:
- Open the `artemis-hub` Replit
- Go to **Secrets** (Environment Variables)
- Add the variables listed below

## 2) Required variables

### GitHub (for pushing from Replit)
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`

Used by:
- One-shot push command (Replit shell does not reliably prompt for credentials)

### Service URLs (integration)
These must point to the deployed apps/APIs:

- `VITE_HUNT_URL`
  - Example: `https://<hunt-replit-domain>`
  - Used for: iframe embed (Hunt inside Hub)

- `VITE_GATE_URL`
  - Example: `https://<gate-replit-domain>`
  - Used for: iframe embed (Gate inside Hub)

- `ARISE_BASE_URL`
  - Example: `https://<arise-replit-domain>`
  - Used for: Hub API forwarding to Arise

## 3) CORS and Origins

CORS allowlist is currently hardcoded in the Hub server code:
- `server/index.ts` (ALLOWED_ORIGINS)
- `server/routes.ts` (CORS_ALLOWED_ORIGINS)

To allow a new origin (new Replit domain), update both lists and redeploy.

## 4) How to validate

After setting Secrets and restarting the Hub, open:

- `/api/debug/env`
  - Expected: shows which variables are present (should not print secrets)
- `/api/debug/cors`
  - Expected: returns whether the current request origin would be allowed (via `allowedOriginEcho`)
- `/api/debug/requests`
  - Expected: empty list initially, then logs requests after E2E actions
- `/api/debug/submit-last`
  - Expected: empty initially, then shows last submit payload after Hunt submit

## 5) Common failures

- Hub loads, but iframe is blank
  - Cause: `VITE_HUNT_URL` or `VITE_GATE_URL` incorrect, blocked, or not deployed

- Submit fails with 4xx
  - Cause: wrong `ARISE_BASE_URL` or Arise schema mismatch

- CORS errors in browser console
  - Cause: missing/incorrect `ALLOWED_ORIGINS`
