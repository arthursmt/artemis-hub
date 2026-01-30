# Artemis — Demo Script (Hub-centered)

Goal:
- Demonstrate the end-to-end flow: Hunt → Hub → Arise → Gate
- Use Hub debug endpoints as evidence

## 0) Open the Hub

1. Open the Hub URL in a browser.
2. Confirm you see:
   - Hunt embedded (iframe)
   - Gate embedded (iframe)

Expected:
- Both frames load without blank screens.

If it fails:
- Check `docs/env-setup.md` for `VITE_HUNT_URL` / `VITE_GATE_URL`
- Confirm origins are allowed in `server/index.ts` and `server/routes.ts`

## 1) Prove Hub is alive (debug endpoints)

Open in a new tab:

- `/api/debug/env`
Expected:
- `hasAriseBaseUrl: true`

- `/api/debug/requests?limit=20`
Expected:
- List (may be empty)

- `/api/debug/submit-last`
Expected:
- Empty before first submit

## 2) Create a proposal in Hunt

Inside Hunt (embedded):

1. Create a group
2. Add at least 1 member
3. Submit proposal

Expected:
- Submit succeeds (201 or success UI)
- You should not see CORS errors in the browser console

## 3) Prove the submit hit the Hub

Refresh:

- `/api/debug/requests?limit=20`
Expected:
- A POST request to `/api/proposals/submit` appears

- `/api/debug/submit-last`
Expected:
- Shows the last submit payload received by Hub

If it fails:
- If requests list is empty: Hunt is calling the wrong URL
- If submit-last shows wrong shape: payload mismatch (wrapped vs unwrapped)

## 4) Prove Hub forwarded to Arise

Expected behavior:
- Hub forwards the normalized payload to:
  `${ARISE_BASE_URL}/api/proposals/submit`

If it fails:
- Hub should return an error indicating ARISE_BASE_URL is missing (502)
- Check Arise logs if Hub returns 4xx/5xx from Arise

## 5) Confirm proposal appears in Gate

Inside Gate (embedded):

1. Open inbox/list
2. Confirm the newly submitted proposal appears
3. Open details and confirm fields render

If it fails:
- Gate may be pointing to the wrong backend URL
- Data shape mismatch between Arise response and Gate UI

## 6) 60-second troubleshooting order

1. `/api/debug/requests`
2. `/api/debug/submit-last`
3. `/api/debug/env`
4. Browser Network tab (URL, status, Origin, Content-Type)
5. Hub logs, then Arise logs

