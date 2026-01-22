# Decisions & Trade-offs

This document records product decisions made during the MVP and the trade-offs accepted. The focus is operational clarity and iteration speed rather than completeness.

## Decision 1 — Single backend hub (ARISE) for multiple frontends
**Choice:** Centralize proposal lifecycle and services in ARISE, with multiple UI clients (Hunt, Gate, future apps).
- **Why:** One source of truth for lifecycle, stages, and data; reduces fragmentation.
- **Trade-off:** Requires stronger API contracts and careful versioning.
- **Mitigation:** Keep endpoints explicit; document stage semantics and payload shapes.

## Decision 2 — Stage-driven operational workflow
**Choice:** Model work around stages rather than free-form statuses.
- **Why:** Backoffice teams need predictable queues and ownership.
- **Trade-off:** Early stage models can feel rigid.
- **Mitigation:** Stage transitions remain simple in MVP; add rules and audit later.

## Decision 3 — Prioritize Gate operational visibility before “perfect” analytics
**Choice:** Add KPI placeholders and workflow overview even before real metrics endpoints exist.
- **Why:** Backoffice needs a shared operational view; KPI design can guide future instrumentation.
- **Trade-off:** Risk of “fake dashboards” if not tracked.
- **Mitigation:** Explicitly label placeholders; link each KPI to a future metric definition.

## Decision 4 — Integration-first reliability (CORS/headers) over feature depth
**Choice:** Stabilize ARISE ↔ Gate integration (requests, CORS, response normalization) early.
- **Why:** A working end-to-end flow is more valuable than isolated UI polish.
- **Trade-off:** Slower feature expansion short-term.
- **Mitigation:** Keep commits and documentation explicit; define next endpoints by stage needs.

## Decision 5 — Missing data must not break operations
**Choice:** UIs should display missing fields as `--` / `Not provided`.
- **Why:** Field capture is imperfect; backoffice must still operate.
- **Trade-off:** Requires careful UX conventions and consistent patterns.
- **Mitigation:** Standardize display rules in docs and component patterns.

## Open questions (intentionally not solved in MVP)
- What is the long-term audit model (events vs. history tables)?
- How will external partners integrate (payments, OCR, risk engine)?
- What is the minimal “decision packet” required for risk approval?

## Next decisions to record
- Stage transition rules and permissions
- Instrumentation plan (which events power which KPIs)
- Data model boundaries between proposal, group, members, evidence
