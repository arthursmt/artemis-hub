# Artemis Hub — Debug Endpoints

These endpoints exist to debug integration issues without guessing.

## 1) /api/debug/env

Purpose:
- Confirm the Hub is running in the expected mode (dev/prod)
- Confirm required env vars are present (without leaking secrets)

Expected:
- `service: "hub"`
- `nodeEnv` or equivalent
- Booleans like `hasAriseBaseUrl: true`

Common failures:
- Missing env vars (e.g., `ARISE_BASE_URL` not set)
- Wrong values (points to the wrong Replit app)

## 2) /api/debug/cors

Purpose:
- Inspect the effective CORS configuration used by the Hub

Expected:
- Allowed origins list (or a summary)
- Allowed methods/headers (if exposed)

Common failures:
- Browser shows CORS errors while the endpoint indicates origins are missing

## 3) /api/debug/requests

Purpose:
- View a rolling log of the most recent requests received by the Hub

Expected:
- A list (possibly empty)
- Each item should include method, path, status (if tracked), timestamp, origin/referer (if tracked)

How to use:
- Open `/api/debug/requests?limit=20`
- Trigger an action in Hunt (submit)
- Refresh and confirm the request appears

Common failures:
- List stays empty: Hunt is not calling the Hub URL you think it is

## 4) /api/debug/submit-last

Purpose:
- Quickly inspect the last submit payload received by the Hub

Expected:
- Empty/None before first submit
- After submit: JSON payload snapshot

Common failures:
- Payload shape mismatch (wrapped vs unwrapped)
- Missing required fields (members, groupId, etc.)

## Debug workflow rule

1) Confirm request reaches Hub (`/api/debug/requests`, `/api/debug/submit-last`)
2) Confirm env/cors (`/api/debug/env`, `/api/debug/cors`)
3) Check browser Network tab (URL, status, Origin, Content-Type)
4) Only then change code

