# Client (Frontend Apps)

The `client/` module contains the user-facing interfaces for the Artemis ecosystem.

## MVP scope
- Field workflow (Hunt): capture proposals, client data, and evidence (docs/photos).
- Backoffice workflow (Gate): review proposals by stage and support operational decisions.

## How it connects
The client consumes ARISE APIs to:
- list proposals by stage
- load proposal/group/member details
- submit or update proposal information (as available in MVP)

## Running locally (high level)
1) Install dependencies
2) Start the dev server
3) Configure environment variables for ARISE base URL

> Note: This repository is used as a product case study + MVP build. Some screens use placeholders while APIs evolve.

## Environment variables (names only)
- `ARISE_API_BASE_URL`
