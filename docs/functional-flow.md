# Artemis — End-to-End Flow (Functional)

## Core rule: Group moves together
This is a **group proposal**. If **any single member** fails, the **entire group** returns to the field agent for correction.
The system must **never lose data**: everything is stored with history, and only the required fixes are requested.

---

## Happy Path (E2E)
1. **Hunt**: create proposal locally (draft)
2. **Hunt → Arise**: submit proposal
3. **Gate**: Document Review (**DOC_REVIEW**)
4. **Gate**: Risk Review (**RISK_REVIEW**)
5. **Gate**: Approve proposal (**APPROVED**)
6. **Arise**: proposal becomes **READY_FOR_CORE_BANKING**
7. **Arise (future)**: dispatch to external Core Banking API + store dispatch history

---

## Error 1 — Submission fails (offline / service down)
1. Hunt attempts submission
2. If it fails, Hunt stores proposal locally and marks it as **PENDING_SYNC**
3. Hunt retries via background/manual sync until success
4. Once synced, Arise returns `proposalId` and the normal flow continues

---

## Error 2 — Rejected on DOC_REVIEW
1. Gate reviewer selects **Reject**
2. Reviewer chooses resolution:
   - **CHANGES_REQUESTED** (editable) OR
   - **FINAL_REJECTED** (final)
3. If **CHANGES_REQUESTED**:
   - Arise stores decision + reasons + findings
   - Arise marks proposal status as **CHANGES_REQUESTED**
   - Hunt polls and shows “Returned for correction”
4. Field agent corrects data/evidence and resubmits
5. Proposal **restarts full flow**: DOC_REVIEW → RISK_REVIEW → …

---

## Error 3 — Rejected on RISK_REVIEW
Same mechanics as Error 2, but at the Risk stage.
Important example: risk may require lowering amounts and **re-collecting signatures** because the contract changed.

---

## Product decision: Correction restarts full flow
When Hunt corrects a CHANGES_REQUESTED proposal and resubmits, it goes again through:
- DOC_REVIEW
- RISK_REVIEW
- Approval

Because the field agent may change other aspects of the proposal.

---

## Final rejection
If the reviewer chooses FINAL_REJECTED:
- Proposal becomes final and should not return to field correction.
- History remains immutable for audit.
