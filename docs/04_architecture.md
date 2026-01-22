# Architecture (MVP)

Artemis is a multi-app credit platform where multiple frontends consume a single service hub backend (ARISE). The MVP prioritizes end-to-end reliability and operational clarity.

## Components
- **Hunt (Field App)**: proposal creation, client capture, evidence collection.
- **Gate (Backoffice)**: proposal review by stage, operational workflow, visibility.
- **ARISE (Service Hub / API)**: central lifecycle services and endpoints consumed by frontends.

## Data flow (high level)
1) Hunt captures proposal + group/member data + evidence
2) Hunt submits to ARISE
3) ARISE stores and exposes proposal lifecycle endpoints
4) Gate consumes ARISE endpoints to list proposals by stage and review details

## Repository mapping (current)
- `apps/hunt/` (snapshot import): Hunt source (Replit import)
- `apps/gate/` (snapshot import): Gate source (Replit import)
- `services/arise/` (snapshot import): ARISE source (Replit import)
- `client/`, `server/`, `backend/`, `shared/`: current runtime structure (existing MVP codebase)

## Integration principles
- **Single source of truth** for proposal lifecycle and stage semantics in ARISE
- **Explicit stage model** for operational queues (Doc Review → Evaluation → Risk Review → Completed)
- **Resilience to missing data**: UIs must display `--` / `Not provided` instead of breaking flows
<img width="4356" height="2456" alt="Artemis Diagram" src="https://github.com/user-attachments/assets/008f37a1-30e4-4ed9-a878-9ccf7e71381c" />
