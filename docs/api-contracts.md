# API Contracts — ARISE (Source of Truth)

This document defines the **backend API contracts** for the Artemis MVP.
Clients:
- **Hunt** (field app) — creates and submits proposals
- **Gate** (backoffice) — reviews proposals and activates contracts

Base URL:
- `ARISE_API_URL` (set in Replit Secrets for Hunt & Gate)

---

## Data Model (MVP)

### Proposal
Represents a submitted credit proposal (group + members + evidence + contract acceptance/signatures).

**Core fields**
- `id` (string)
- `status` (string) — `draft | submitted | under_review | approved | rejected | active`
- `createdAt`, `updatedAt` (ISO string)
- `group` (object)
- `members` (array)
- `evidence` (array)
- `contract` (object)
- `auditTrail` (array)

---

## Endpoints

### 1) Health check
**GET** `/api/health`

**200 Response**
```json
{ "ok": true }

2) Submit proposal (Hunt → Arise)

POST /api/proposals/submit

Request body (MVP)

{
  "group": { "name": "Group A", "location": "..." },
  "members": [
    { "name": "Member 1", "documentId": "..." }
  ],
  "form": { "requestedAmount": 1000, "termMonths": 6 },
  "evidence": [
    { "type": "photo", "url": "..." }
  ],
  "contract": {
    "version": "v1",
    "accepted": true,
    "signatures": [
      { "memberIndex": 0, "signedAt": "2026-01-22T00:00:00Z" }
    ]
  }
}

3) List proposals (Gate inbox)

GET /api/proposals?status=submitted

200 Response
{
  "items": [
    { "id": "prp_123", "status": "submitted", "createdAt": "..." }
  ]
}

4) Get proposal details (Gate preview)

GET /api/proposals/:id

200 Response
{
  "id": "prp_123",
  "status": "submitted",
  "group": {},
  "members": [],
  "form": {},
  "evidence": [],
  "contract": {},
  "auditTrail": []
}
404 if not found

5) Review decision (Gate → Arise)

POST /api/proposals/:id/decision

Request
{
  "reviewer": { "name": "Backoffice User" },
  "decision": "approved",
  "notes": "Looks good"
}
200 Response
{ "id": "prp_123", "status": "approved" }

Rules

If decision=approved, proposal can transition to approved (and later active)

If decision=rejected, proposal transitions to rejected

6) Activate contract (Gate → Arise) (optional MVP)

POST /api/proposals/:id/activate

200 Response
{ "id": "prp_123", "status": "active" }
Status transitions (MVP)

draft → submitted (Hunt submits)

submitted → under_review (optional)

submitted/under_review → approved | rejected (Gate decision)

approved → active (Gate activation or auto-activation)


