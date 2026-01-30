# Artemis Hub — Integration & E2E Demo Portfolio

**Artemis Hub** is the integration/portfolio repository for the Artemis ecosystem.  
It is **not** where feature development happens — development lives in the app-specific repos.

What this repo *does*:
- Explains **how the ecosystem fits together** (architecture + responsibilities)
- Provides an **end-to-end (E2E) demo runbook**: Hunt ➜ Arise ➜ Gate ➜ Contract activation
- Centralizes **API contracts**, **environment variables**, and **setup checklists**
- Works as the “single entry point” for recruiters/reviewers to understand the product journey

## Documentation
- Functional E2E flow: `docs/functional-flow.md`
- Technical contracts: `docs/technical-contracts.md`
- API contracts (source of truth narrative): `docs/api-contracts.md`
- E2E runbook: `docs/e2e-runbook.md`

---

## 1) Ecosystem Overview

Artemis MVP is an ecosystem of 3 apps:

- **Artemis Hunt** (field app)  
  Mobile-first workflow for credit agents: prospecting, client onboarding, group/proposal creation, evidence capture, contract signing, and proposal submission.

- **Artemis Arise** (backend/API)  
  Core services that validate, persist, route, and expose integration endpoints for Hunt and Gate. Source of truth for API contracts and E2E env setup.

- **Artemis Gate** (backoffice)  
  Reviewer workflow: proposal inbox, triage, preview, decision panel, audit trail, and contract activation.

**E2E goal:** a reliable demo that proves the full pipeline from field submission to approval and activation.

---

## 2) Repositories

- **Hunt (Field App)**: `arthursmt/artemis-hunt`  
  Repo: https://github.com/arthursmt/artemis-hunt  
  Replit: TODO (add link)

- **Arise (Backend/API)**: `arthursmt/artemis-arise`  
  Repo: https://github.com/arthursmt/artemis-arise  
  Replit: TODO (add link)

- **Gate (Backoffice)**: `arthursmt/artemis-gate`  
  Repo: https://github.com/arthursmt/artemis-gate  
  Replit: TODO (add link)

> Legacy / case repo: **artemis-finance** (kept as a separate “case study” and historical build log)

---

## 3) Architecture (How apps talk)

**Integration is API-driven.**  
- Hunt submits proposals and evidence payloads to Arise.
- Gate reads proposals from Arise for review and decisioning.
- Arise records status transitions and exposes endpoints used by both apps.

**Contracts & statuses are owned by Arise.**  
Apps should not “invent” business states — they render the state coming from Arise.

---

## 4) End-to-End Demo (MVP Journey)

**Flow:**
1. **Hunt**: create group/proposal, capture evidence, sign contract, submit proposal
2. **Arise**: validate + persist proposal, return status + proposal ID
3. **Gate**: load proposal inbox, open proposal, review evidence, approve/reject
4. **Arise**: finalize decision, set contract status to “active” (or rejected)
5. (Future) **Client App**: payments, renewal, credit lifecycle

To run the E2E demo, follow:  
➡️ `docs/e2e-runbook.md`

---

## 5) API Contracts

API contracts live in the **Arise** repo and are referenced here as the integration source of truth.

- Contract reference (Arise): `docs/api-contracts.md` (or TODO if not created yet)
- Required endpoints for MVP:
  - `POST /api/proposals/submit`
  - `GET /api/proposals`
  - `GET /api/proposals/:id`
  - `POST /api/proposals/:id/decision` (approve/reject)
  - `POST /api/contracts/:id/activate` (or decision triggers activation)

> We will formalize contracts after repo setup is stable.

---

## 6) Environment Variables (E2E)

Environment variables must be consistent across repos to make integration predictable.
We keep a single checklist here:

➡️ `docs/env-setup.md`

---

## 7) Roadmap (near-term)

- [ ] Write `docs/e2e-runbook.md` (step-by-step E2E simulation)
- [ ] Write `docs/env-setup.md` (one place for all required env vars)
- [ ] Formalize `docs/api-contracts.md` in Arise and reference from Hub
- [ ] Add a simple architecture diagram (optional)
- [ ] Add “Demo script” for recruiters: what to click, what to expect

---

## Why this repo matters

Without a hub, multi-repo projects look fragmented.  
**Artemis Hub** makes the system readable, reviewable, and demoable — it’s the integration story and proof of product thinking.

## GitHub push from Replit (no credential prompt)

Replit Shell may not prompt for GitHub credentials. Use Replit Secrets and perform an authenticated one-shot push.

### Required Replit Secrets
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`

### Verify secrets and repo state
```bash
cd ~/workspace
set -e
echo "GITHUB_USERNAME=${GITHUB_USERNAME:-<missing>}"
if [ -n "${GITHUB_TOKEN:-}" ]; then echo "GITHEB_TOKEN=present"; else echo "GITHUB_TOKEN=<missing>"; fi
git remote -v
git status -sb
```

### One-shot push using token (does not persist token in git config)
```bash
cd >/workspace
set -e
git push "https://${GITHUB_USERNAME}:${GITHEB_TOKEN}@github.com/arthursmt/artemis-hub.git" main
```

### Sync tracking refs after push
```bash
cd >/workspace
set -e
git fetch origin --prune
git status -sb
```

### Confirm token was not stored in git remote
```bash
cd >/workspace
set -e
git remote -v
git config --get remote.origin.url || true
git config --get remote.origin.pushurl || true
```

### Common failures
- `Invalid username or token`: token invalid or missing write permissions
- `Permission denied`: token belongs to a user without write access
- `Repository not found`: wrong URL or no access to the repo
