# API Contracts (MVP)

This document captures the minimum API contract expectations between Gate/Hunt and ARISE.

## Core concept: stage-based workflow
Gate operates on queues by stage. ARISE must provide stable endpoints that support:
- listing proposals filtered by stage
- fetching proposal/group/member details
- basic health/debug checks (for integration stability)

## Response shape stability
During MVP, the most critical requirement is predictable response shapes so the Gate UI does not break when iterating.

If response shapes change:
- document the change here
- update Gate normalization logic
- add a short note in commit description

## CORS & headers
Cross-origin requests are expected when Gate and ARISE run on different domains/environments.
- CORS must allow Gate origin(s)
- required headers must be explicitly permitted

## Future extensions (not required now)
- Audit events endpoint
- Stage transition endpoint with permissions
- Evidence storage/retrieval APIs (beyond MVP placeholders)
