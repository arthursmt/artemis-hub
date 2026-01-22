# Server (Runtime & API Handlers)

The `server/` module contains the backend runtime and request handling layer used by the Artemis MVP.

## Responsibilities
- API routing and request handling
- Integration glue between client and backend services
- Basic operational diagnostics (health/debug paths as needed)

## Integration note (MVP)
The priority is end-to-end reliability between Gate and ARISE (requests, headers, CORS behavior, and response shape stability).

## Environment variables (names only)
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
