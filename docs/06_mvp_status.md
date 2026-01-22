# MVP Status

This document lists what works today and what is planned next.

## Working today (high confidence)
- Gate UI: stage-based workflow screens and operational visibility scaffolding
- ARISE ↔ Gate integration: basic connectivity and endpoints used by Gate (including stage listing)
- Documentation: ecosystem overview, workflow stages, trade-offs, architecture

## In progress / partially implemented
- Proposal details consistency across Gate views
- Evidence capture and display end-to-end

## Next milestones
1) Formalize stage transition rules + audit trail
2) Define minimal decision packet for Risk Review
3) Instrument KPIs with real events/endpoints (replace placeholders)

## Known risks
- Multiple code structures exist (legacy runtime folders + snapshot imports). Next step is consolidation.
- Integration changes can break UI if response shapes drift without documentation.
