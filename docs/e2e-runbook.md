# Artemis Hub — E2E Runbook (Hunt → Hub → Arise → Gate)

This document is the single step-by-step checklist to validate the end-to-end flow.

## 0) Prerequisites

- Replit Secrets set in this repo:
  - `GITHUB_USERNAME`
  - `GITHUB_TOKEN`
- Hub is running (Replit "Run" button or `npm run dev`).
- Hunt and Gate are embedded by Hub via iframe.
- Arise is reachable from Hub (via configured base URL/env).

## 1) Start the Hub

1. Open the Hub Replit.
2. Click **Run**.
3. Confirm the app is reachable in the Replit webview.

Expected:
- Hub loads a page that embeds Hunt and Gate.
- No CORS errors in browser console.

Common failures:
- Hub fails to boot (missing env vars, wrong node version).
- Blank iframe due to wrong embed URL or CSP restrictions.

## 2) Smoke test the Hub debug endpoints

Open these endpoints in a browser tab:

- `/api/debug/env`
- `/api/debug/cors`
- `/api/debug/requests`
- `/api/debug/submit-last`

Expected:
- `env` returns a sanitized view (no secrets printed).
- `cors` returns allowed origins configuration (or summary).
- `requests` returns a list (may be empty).
- `submit-last` returns last submit payload (may be empty initially).

Common failures:
- 404: route not wired in Hub.
- 500: server error; check Hub logs.

## 3) Submit a proposal from Hunt via Hub

From the embedded Hunt UI:

1. Create a group.
2. Add members.
3. Submit proposal.

The Hunt must send:
- `POST /api/proposals/submit` (to Hub)

Expected:
- Hub returns `201 Created` (or equivalent success).
- The request appears in `/api/debug/requests`.
- `/api/debug/submit-last` shows the last received submit payload.

Common failures:
- 400: payload invalid or missing required fields.
- 415: content-type not set to `application/json`.
- No request logged: Hunt is calling the wrong base URL.

## 4) Validate Hub → Arise forwarding

Expected behavior:
- Hub forwards the normalized payload to Arise `POST /api/proposals/submit`
- Arise accepts both formats:
  A) `{ groupId, members, ... }`
  B) `{ proposalId, payload: { groupId, members, ... } }`
- Arise validates the normalized body and persists it.

Expected:
- Hub response stays success.
- Arise logs show normalized validation step.
- A new proposal is persisted and can be fetched by Gate.

Common failures:
- 400 from Arise: schema mismatch or normalization not applied.
- Network error: wrong Arise base URL from Hub env.

## 5) Confirm proposal appears in Gate

From embedded Gate UI:

1. Open inbox/list.
2. Confirm the newly submitted proposal appears.

Expected:
- Proposal card/list item appears.
- Details render without missing fields.

Common failures:
- Gate points to wrong backend base URL.
- Data shape mismatch between Arise response and Gate UI.

## 6) Debug checklist (when something fails)

1. Confirm request reaches Hub:
   - `/api/debug/requests`
   - `/api/debug/submit-last`
2. Confirm Hub env/cors:
   - `/api/debug/env`
   - `/api/debug/cors`
3. Check browser Network tab:
   - request URL, method, status
   - request headers: Origin, Content-Type
4. Check Hub logs (server console)
5. Check Arise logs (server console)

Rule:
- Collect evidence first, then change code.

