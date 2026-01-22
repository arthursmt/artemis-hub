# Artemis Finance – Credit Platform MVP

Product case study and MVP design of a multi-app credit platform for microfinance and lending operations.

This repository currently contains the **Artemis Hunt** app – the tablet-first tool used by field credit agents to prospect clients, build group loan proposals, run basic risk checks and configure loan products before sending them for approval.

ECOSYSTEM MAP (MVP)

HUNT (Field App)  ->  ARISE (Service Hub / API)  ->  GATE (Backoffice)
- Hunt: creates proposals, captures client data and evidence (docs/photos)
- ARISE: validates, stores, and exposes proposal lifecycle endpoints (stages)
- Gate: reviews proposals by stage, supports workflow and operational visibility

Repository structure (current)
- client/   -> Frontend app(s) (Hunt/Gate UI code depending on module)
- server/   -> Backend runtime / API handlers
- backend/  -> Backend services / integration layers (ARISE components)
- shared/   -> Shared types/components/utilities across apps
- attached_assets/ -> Screenshots and diagrams

---

## 1. Overview

Traditional microfinance and small-ticket lending still rely heavily on:

- Paper forms and manual data entry  
- Fragmented tools (WhatsApp, spreadsheets, legacy core systems)  
- Little or no support for **group lending**  
- Poor visibility of portfolio quality at the agent level  

Artemis Finance is a product concept for a digital credit platform designed around two realities:

1. Many borrowers are **thin-file customers** (immigrants, foreign nationals, informal workers).  
2. Most credit origination still happens through **human relationships in the field**, not in a branch.

This MVP focuses on the **field agent experience**. The goal is to show how a well-designed workflow and validations can reduce operational risk while keeping the UI fast and simple for agents who are working under time and connectivity pressure.

---

## 2. What this MVP does

From the point of view of a **credit agent**, the Artemis Hunt MVP allows them to:

- View an **“On Going Proposals”** list and resume partially completed applications  
- Start a **new credit proposal** for an individual or a group  
- Build a **group loan** with up to 5 members  
- Capture each member’s:
  - Loan configuration (Loan Details tab)  
  - Personal data  
  - Business data (planned)  
  - Simple P&L / financials (planned)

The current implementation focuses on two screens:

1. **Proposals List (Dashboard)**  
   - Shows all ongoing proposals with client name, amount, status and actions  
   - Allows the agent to open a proposal, continue filling, view details or delete it  
   - Preserves data when the agent edits a proposal and comes back later  

2. **Product Configuration / Member Form**  
   - Header with **Group ID**, **Leader name** and **base credit rate**  
   - Tabs for each member (1…N), always keeping the group leader in position #1  
   - Inside each member, sub-tabs:
     - **Loan Details** (implemented)
     - **Personal Data** (implemented)
     - **Business Data** (placeholder)
     - **Financials (P&L)** (placeholder)

---

## 3. Loan Details – UX and business rules

The **Loan Details** tab is designed to be clear on a tablet screen while enforcing key credit policies.

### Fields and behaviour

- **Loan value ($)**
  - Prefilled from the initial prospecting step  
  - Formatted as US currency (supports cents/decimals)  
  - Adjustable via four quick buttons: `+500`, `+1k`, `-500`, `-1k`  
  - Business rules:
    - Minimum: **$500**
    - Maximum: **$50,000**
    - Errors are shown inline if the user goes out of range

- **Loan type**
  - Dropdown (Working capital, Investment, Other)  
  - Defaults to **Working capital**

- **Interest rate (APR, % per year)**
  - Non-editable field  
  - Default: **14% APR fixed** (base credit rate shown in the header)

- **Number of installments**
  - Dropdown list from **3 to 12 months**  
  - Changes here automatically recalculate the monthly installment

- **First payment date**
  - Date picker with two rules:
    - Must be **within 60 days** from today  
    - Must be **on or before the 15th** of the chosen month  
  - If the agent tries to pick an invalid date, an error explains why

- **Grace period (days)**
  - Read-only field  
  - Calculated automatically as the number of days between **today** and the selected **first payment date**

- **Loan goal**
  - Dropdown with options like Inventory, Equipment purchase, Working capital, Debt consolidation, Other  
  - When the agent selects **Other**, an **“Other goal (optional)”** text field appears

---

## 4. Insurance logic & monthly payment summary

The app also helps the agent explain the **real monthly cost** of the loan.

### Borrower’s Insurance (Credit Life)

- Boolean/toggle: **Yes / No** (defaults to **Yes**)  
- Premium is **2% of the principal (loan value)** – no interest applied  
- The UI shows:
  - Total cost of credit life insurance  
  - Monthly share included in the payment summary

### Optional insurances

Three cascading dropdowns:

1. **Optional insurance 1**  
2. **Optional insurance 2** (only appears if #1 ≠ None)  
3. **Optional insurance 3** (only appears if #2 ≠ None)

Current options and example pricing:

- **Health Plus** – \$40/month – “Provides extra protection in case of major medical events.”  
- **Work Loss** – \$20/month – “Helps cover your loan payments if you lose your job.”  
- **Income Protection** – \$30/month – “Offers a safety net if your income is temporarily reduced.”  
- **None**

For each selected insurance:

- The dropdown label includes the monthly price  
- An info icon (`i`) opens a short explanation  
- The **Summary** section adds up all selected insurance premiums.

### Summary Box

At the bottom of the Loan Details tab, a summary card displays:

- **Base monthly installment** (principal + interest, fixed-installment formula)  
- **Credit life insurance – monthly share**  
- **Optional insurances – total monthly**  
- **Interest rate** (14% APR)  
- **First payment date** and **due day of month**  
- **Total monthly payment** = installment + all insurances  

This is designed to support transparent conversations with the client and reduce future disputes about the actual payment amount.

---

## 5. Personal Data tab

Each group member has a **Personal Data** form with validation for mandatory fields.  

Fields include:

- First name, Middle name, Last name  
- Document type (e.g., SSN, Driver’s License)  
- Document ID  
- Country of origin  
- Birth date  
- Home address (1 & 2)  
- State, City, ZIP code  
- Up to **three contact numbers** (type + number)  
- Up to **two references** (name + phone)

Mandatory fields are clearly marked and validated when the agent saves or navigates away.

---

## 6. Group management & leader logic

The proposal is always a **group**, even if it has one member.

- The agent can **add members** up to a maximum of **five**  
- Members keep their position in the tab bar (no unexpected reordering)  
- The group leader is always shown as **Member 1**  
- There is an option to **change the leader**:
  - Opens a dialog listing existing members
  - After confirmation, the chosen leader moves to position #1
  - All other members keep their relative order

Data for each member (Loan Details + Personal Data) is persisted so that proposals can be resumed from the dashboard.

---

## 7. Architecture & tech stack

This repository is organized as a small monorepo:

- `client/` – **Artemis Hunt** web app (React + TypeScript + Vite, styled for tablet use)  
- `backend/`, `server/` – API and infrastructure scaffolding from the Replit stack, used for future evolution of the platform  
- `shared/` – Shared utilities and types (e.g. proposal store, domain models)  
- `attached_assets/` – Design and prompt assets used while iterating on the product  

Key technologies:

- **React** + **TypeScript**  
- Modern React state management (proposal store for groups and members)  
- Tailwind-style utility classes for layout and spacing  
- Simple persistence layer behind the proposal store (via Replit stack and SQL/ORM config)

> This is intentionally scoped as an MVP. The focus is on **product design, UX, and business rules**, not on building a full production-grade backend.

---

## 8. Running the project

This project is developed primarily in **Replit**.

To run it locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/arthursmt/artemis-finance.git
   cd artemis-finance

2. Install dependencies (from the root):
npm install

3. Start the development server:
npm run dev
If the scripts differ, check the package.json in the root or in the client/ folder and run the appropriate dev script from there.
   
9. Roadmap & next steps

Planned extensions of this MVP include:

Completing the Business Data and Financials (P&L) tabs

Adding a simple risk score based on member data and loan configuration

Role-based flows for back-office teams (credit committee, operations)

Audit trail and activity log per proposal

Exporting proposals to a core banking / LOS system

10. Notes for reviewers & recruiters

This repository is part of a product portfolio and is meant to show:

Ability to frame a lending problem and translate policies into product constraints

Design of clear, tablet-friendly flows for field agents

Careful handling of edge cases and validations (dates, amounts, group structure)

Ability to work hands-on with a modern frontend stack to get from concept to a working MVP

If you have questions about the product decisions, trade-offs, or roadmap, feel free to open an issue or reach out via LinkedIn.
