# Roadmap: SMB F&B AI Co-Pilot

## Overview

A four-phase build starting with the locked tooling scaffold — where wrong version pins cascade through everything — then progressing through global state and the app shell, then the high-value visual surfaces (cash flow chart, AI insights, supplier payments), and finally the reactive scenario simulator and production build. Each phase delivers a coherent, independently testable capability. The prototype is demo-ready when Phase 4 ships.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Scaffold, tooling, data model, global state, and navigable app shell with dark theme
- [ ] **Phase 2: Cash Flow Dashboard** - 14-day forecast chart with confidence bands, shortfall warning, and responsive layout grid
- [ ] **Phase 3: AI Features and Supplier Payments** - InsightCards with approve/dismiss, "Why this?" reasoning, SupplierList, and contextual FinanceCard
- [ ] **Phase 4: Simulator, Tests, and Build** - Reactive scenario simulator with delta indicator, 20 passing Vitest tests, and deployable dist/

## Phase Details

### Phase 1: Foundation
**Goal**: The app runs, routes correctly, renders in dark theme, and all data types and global state are available before any feature component is built
**Depends on**: Nothing (first phase)
**Requirements**: TOOL-01, TOOL-02, TOOL-03, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts cleanly with no TypeScript or ESLint errors and the app renders stub Dashboard, Simulate, and Payments screens in webDarkTheme
  2. Navigating between `/`, `/simulate`, and `/payments` via the NavBar changes the active screen; the NavBar appears fixed at bottom on mobile and at top on desktop
  3. FluentProvider wraps the app outside HashRouter in `main.tsx` — Fluent components show dark theme tokens, not flat grey
  4. `npm test` runs (even with 0 tests yet) without crashing — jsdom canvas mock and ResizeObserver polyfill are in place
  5. AppContext exposes typed AppState seeded from mock data; `applySimulation` returns a new forecast array without mutating its input
**Plans**: TBD

### Phase 2: Cash Flow Dashboard
**Goal**: An F&B owner landing on the Dashboard sees their current balance and a 14-day forecast chart with confidence bands, and receives a clear warning if a shortfall is projected
**Depends on**: Phase 1
**Requirements**: CASH-01, CASH-02, CASH-03, RESP-01, RESP-02, RESP-03
**Success Criteria** (what must be TRUE):
  1. The cash flow chart renders a 14-day line chart with a dashed forecast line, shaded confidence band fill between upper and lower bounds, a today vertical marker, and a zero baseline
  2. Current balance is displayed prominently above the chart in currency format
  3. A warning MessageBar (intent="warning") appears on the Dashboard when any projected balance in the forecast goes negative, showing the shortfall date and amount
  4. On mobile (<768px) the Dashboard shows a single-column layout with the chart full-width; on tablet (768–1024px) it shows a two-column layout; on desktop (>1024px) it shows a three-column layout
**Plans**: TBD

### Phase 3: AI Features and Supplier Payments
**Goal**: The demo narrative is complete — an owner can read AI recommendations with reasoning, act on them, see supplier priorities, and receive a contextual financing suggestion when the forecast is negative
**Depends on**: Phase 2
**Requirements**: INSG-01, INSG-02, INSG-03, INSG-04, INSG-05, SUPP-01, SUPP-02, SUPP-03, FIN-01, FIN-02, RESP-04
**Success Criteria** (what must be TRUE):
  1. Each InsightCard displays title, description, impact amount, and a confidence badge (Low/Medium/High); the "Why this?" Accordion section expands to show signal, causal chain, and projected outcome reasoning
  2. Clicking Approve updates the InsightCard to a confirmed visual state; clicking Dismiss updates it to a dismissed state — both changes persist in AppContext without page reload
  3. The Payments screen shows 6 supplier rows each with name, amount, due date, a priority badge (Flexible/High Priority), and AI recommendation text; on mobile the table renders as a card list with no horizontal scroll
  4. The FinanceCard appears on the Dashboard only when the forecast contains a projected negative balance and is not shown when no shortfall exists
**Plans**: TBD

### Phase 4: Simulator, Tests, and Build
**Goal**: The prototype is interactive end-to-end (slider moves redraw the chart in real time), fully tested, and produces a deployable static build
**Depends on**: Phase 3
**Requirements**: SIM-01, SIM-02, SIM-03, SIM-04, TEST-01, BUILD-01, BUILD-02
**Success Criteria** (what must be TRUE):
  1. Moving the delay-payment Slider or loan Slider on the Simulate screen causes the CashFlowChart to redraw immediately showing the adjusted forecast — no page reload, no perceptible lag
  2. The delta indicator strip shows the before/after projected balance impact (e.g., "Without changes: shortfall of $1,240 | With your changes: surplus of $420") and updates as simulation parameters change
  3. `npm test` reports 20 passing tests: 5 for applySimulation, 4 for the reducer, 3 for CashFlowChart, 4 for InsightCard, 4 for SupplierList
  4. `npm run build` completes with no TypeScript or build errors and produces a `dist/` folder that serves correctly as static files with HashRouter (no 404 on direct navigation)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Cash Flow Dashboard | 0/TBD | Not started | - |
| 3. AI Features and Supplier Payments | 0/TBD | Not started | - |
| 4. Simulator, Tests, and Build | 0/TBD | Not started | - |
