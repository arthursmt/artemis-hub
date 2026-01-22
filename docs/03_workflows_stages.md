# Workflows & Stages (MVP)

This document describes the proposal lifecycle used across the Artemis ecosystem. The goal is to keep the process explicit, auditable, and easy to operate for small lending teams.

## Primary workflow (end-to-end)
**HUNT (Field App)** creates and submits proposals → **ARISE (Service Hub/API)** stores and exposes lifecycle endpoints → **GATE (Backoffice)** reviews proposals by stage and supports decision-making.

## Stage model (MVP)
Stages are designed for operational clarity, not just engineering convenience.

1) **DOC_REVIEW**
- Purpose: validate completeness and evidence (IDs, photos, required fields).
- Typical actions: request missing data, confirm membership and contact details.

2) **IN_PROGRESS / UNDER_EVALUATION**
- Purpose: collect additional information and run initial checks.
- Typical actions: update proposal data, verify business/personal details, start risk checks.

3) **RISK_REVIEW**
- Purpose: finalize risk assessment and decision recommendation.
- Typical actions: approve/reject, set conditions, request additional documents.

4) **COMPLETED**
- Purpose: lifecycle terminal state (approved/rejected/disbursed as future expansion).
- Typical actions: finalize record, keep audit trail.

## Key user roles (MVP)
- **Field Agent (Hunt):** captures data and evidence, submits proposal.
- **Backoffice Analyst (Gate):** validates documents, manages stages, operational follow-up.
- **Risk Analyst (Gate):** reviews risk stage and decision inputs.

## Data expectations (handling missing data)
For operational UIs, missing fields should be displayed as:
- `--` for unknown/unavailable
- `Not provided` when user explicitly skipped a step

This prevents broken layouts and improves reviewer speed.

## What exists today vs. next
**Exists today**
- Gate UI supports stage-based listing and proposal review flows (early stage).
- ARISE exposes endpoints consumed by Gate (including stage-based listing).
- Hunt captures core proposal data and evidence (MVP direction).

**Next**
- Define explicit stage transition rules (who can move what and when).
- Add audit trail entries for stage transitions and key decisions.
- Add consistency validations (required fields per stage).
