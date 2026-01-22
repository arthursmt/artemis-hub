# E2E Runbook — Artemis Demo (Hunt ➜ Arise ➜ Gate)

This runbook is a **click-by-click** script to demonstrate the Artemis MVP end-to-end flow:
**Hunt (field submission)** ➜ **Arise (API)** ➜ **Gate (review + activation)**.

---

## 0) Pre-flight Checklist (2 minutes)

✅ You should have:
- Replit deployments running for:
  - Hunt
  - Gate
  - Arise
- The env vars set (see `docs/env-setup.md`)
- A clean browser session (optional but reduces caching issues)

---

## 1) Start services (Replit)

Open 3 tabs (Replit):
1. **Arise** — ensure it is running (API up)
2. **Gate** — ensure UI loads
3. **Hunt** — ensure UI loads

**Success criteria**
- Arise responds (no server crash)
- Gate loads inbox page
- Hunt loads the proposal creation flow

---

## 2) Hunt — Create and submit a proposal

In **Hunt**:
1. Create a new proposal/group
2. Fill required customer/member fields
3. Capture / attach evidence (if the UI supports it)
4. Open contract screen
5. Scroll + accept agreement
6. Sign (as required by the flow)
7. Submit proposal

**Expected result**
- You see a “submitted” confirmation
- You capture the **proposal ID** (or any visible identifier)

> If there is no visible proposal ID, note the timestamp and proceed to Gate; Gate should show the newest item.

---

## 3) Arise — Confirm the submission landed

In **Arise** (API verification):
- Confirm proposal exists via API endpoint (depending on current implementation):
  - `GET /api/proposals`
  - `GET /api/proposals/:id`

**Expected result**
- Proposal appears in list
- Status reflects “submitted” (or equivalent)

---

## 4) Gate — Review and decide

In **Gate**:
1. Open Inbox
2. Find the newest proposal (or match by ID)
3. Open proposal details / preview
4. Review evidence + contract section
5. Use Decision Panel:
   - Approve **or** Reject
6. Submit decision

**Expected result**
- Proposal status updates in the UI
- Audit trail reflects the decision (if implemented)
- Contract becomes “active” after approval (or “rejected” after reject)

---

## 5) Arise — Confirm decision & activation

In **Arise**:
- Confirm status transition via API:
  - `GET /api/proposals/:id`
  - (optional) `GET /api/contracts/:id`

**Expected result**
- Proposal now reflects reviewer decision
- If approved: contract is active (or equivalent state)

---

## 6) Demo Summary (what you say to a reviewer)

**What this proves:**
- Field submission workflow (Hunt)
- Central backend validation + persistence (Arise)
- Backoffice review + decision (Gate)
- Full status transition across the system (E2E)

---

## Troubleshooting

### Gate inbox is empty
- Arise not running, wrong API URL, or env var mismatch (see `docs/env-setup.md`)

### Submission fails in Hunt
- Arise URL not configured
- CORS / route mismatch
- Missing required fields (form validation)

### Decision doesn’t persist
- Gate decision endpoint mismatch vs Arise
- Env var mismatch
- API contract changed but not reflected in Gate

Log what failed + screenshot the error; fix via Arise contract alignment.

