# Artemis — Technical Contracts (API + Workflow)

This document is the **contract-first** reference for the E2E demo:
Hunt → Arise → Gate → Arise → (future) Core Banking.

> Source of truth schemas/types live in: `arthursmt/artemis-contracts`.

---

## Concepts (do not mix)
### Stage (pipeline)
- DOC_REVIEW
- RISK_REVIEW
- APPROVED
- REJECTED

### Status (operational mode)
- SUBMITTED
- IN_REVIEW
- CHANGES_REQUESTED
- FINAL_REJECTED
- READY_FOR_CORE_BANKING
- DISPATCHED_TO_CORE_BANKING
- DISPATCH_FAILED

### Hunt-only sync status (offline)
- LOCAL_ONLY
- PENDING_SYNC
- SYNCED
- SYNC_FAILED

---

## Rejection resolution (critical)
When Gate rejects, it must declare:
- `resolution = CHANGES_REQUESTED` OR `FINAL_REJECT`
- plus findings per member when relevant (group moves together)

---

## Minimal API (MVP)

### Health
GET /api/health

### Submit proposal (Hunt → Arise)
POST /api/proposals/submit
- Body: proposalPayloadSchema (artemis-contracts)
- Response: proposalId, stage (DOC_REVIEW), submittedAt

### Gate inbox
GET /api/gate/proposals?stage=DOC_REVIEW|RISK_REVIEW|APPROVED|REJECTED

### Gate proposal detail
GET /api/gate/proposals/:proposalId

### Gate decision
POST /api/gate/proposals/:proposalId/decision
- Body: decisionRequestSchema (artemis-contracts)
- Response: previousStage, newStage, decision

---

## Polling (MVP integration back to Hunt)
Hunt must query proposals returned for correction.

### Hunt "returns for correction"
GET /api/hunt/proposals?status=CHANGES_REQUESTED

### Hunt proposal detail
GET /api/hunt/proposals/:proposalId
