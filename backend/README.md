# Backend (ARISE Services)

The `backend/` module represents ARISE — the service hub that centralizes proposal lifecycle services for multiple frontends.

## What ARISE provides (MVP)
- Proposal lifecycle storage and retrieval
- Stage-based listing endpoints used by Gate
- Shared data model for proposal, group, members, and evidence (as implemented)

## Why it exists
Multiple apps (Hunt, Gate, future channels) should consume the same services and stay consistent in workflow and data semantics.

## What’s next
- Stage transition rules and permissions
- Audit trail for decisions and lifecycle changes
- External integrations (OCR/doc evaluation, risk engines, payments)
