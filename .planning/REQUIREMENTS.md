# Requirements: SMB F&B AI Co-Pilot

**Defined:** 2026-04-03
**Core Value:** An F&B owner can see a projected cash shortfall before it happens, understand exactly why the AI is recommending an action, and make a confident decision — without needing financial training.

## v1 Requirements

### Scaffold & Tooling

- [ ] **TOOL-01**: Project scaffolded with Vite react-ts template, all dependencies installed at correct versions (react-router-dom@^6, typescript@^5)
- [ ] **TOOL-02**: Vitest configured with jsdom, canvas mock, ResizeObserver polyfill, and jest-dom globals in setup.ts
- [ ] **TOOL-03**: ESLint + Prettier configured; dev server starts cleanly

### Data & State

- [ ] **DATA-01**: TypeScript types defined for Transaction, ForecastData, Insight, Supplier, SimulationState, AppState
- [ ] **DATA-02**: Static mock data files created: 15 transactions, 14-day forecast (with shortfall on Jan 21–22), 4 AI insights, 6 suppliers
- [ ] **DATA-03**: AppContext with useReducer provides global AppState seeded from mock data
- [ ] **DATA-04**: Reducer handles APPROVE_INSIGHT, DISMISS_INSIGHT, SET_SIMULATION actions without mutating state
- [ ] **DATA-05**: Pure `applySimulation(forecast, simulationState)` function returns new array with adjusted balances

### App Shell & Navigation

- [ ] **NAV-01**: App wrapped in FluentProvider (webDarkTheme) at root, outside HashRouter
- [ ] **NAV-02**: HashRouter with routes: `/` → Dashboard, `/simulate` → Simulate, `/payments` → Payments
- [ ] **NAV-03**: NavBar renders Fluent TabList with active route highlighting; bottom-fixed on mobile, top on desktop

### Cash Flow Feature

- [ ] **CASH-01**: CashFlowChart renders 14-day line chart with projected balance, confidence lower/upper bands using Chart.js Filler plugin
- [ ] **CASH-02**: Shortfall warning MessageBar (intent="warning") appears when any projected balance goes negative
- [ ] **CASH-03**: Dashboard displays current balance prominently above chart

### AI Insights Feature

- [ ] **INSG-01**: InsightCard displays title, description, impact amount, and confidence badge (Low/Medium/High)
- [ ] **INSG-02**: "Why this?" Accordion section expands to show reasoning text per insight
- [ ] **INSG-03**: Approve button dispatches APPROVE_INSIGHT; card updates to confirmed state
- [ ] **INSG-04**: Dismiss button dispatches DISMISS_INSIGHT; card updates to dismissed state
- [ ] **INSG-05**: Dashboard shows ranked list of pending AI insights

### Scenario Simulator Feature

- [ ] **SIM-01**: SimulatorPanel has Switch to enable/disable payment delay + Slider for delay days (0–30)
- [ ] **SIM-02**: SimulatorPanel has Switch to enable/disable loan + Slider for loan amount
- [ ] **SIM-03**: Chart updates in real-time as simulation parameters change (reactive via applySimulation)
- [ ] **SIM-04**: Delta indicator shows before/after projected balance impact of current simulation settings

### Supplier Payments Feature

- [ ] **SUPP-01**: SupplierList displays 6 suppliers with name, amount, due date, priority badge (Flexible/High Priority)
- [ ] **SUPP-02**: AI recommendation text shown per supplier row
- [ ] **SUPP-03**: Payments screen renders SupplierList with full supplier data

### Contextual Financing

- [ ] **FIN-01**: FinanceCard displays non-intrusive financing suggestion with cost/benefit summary
- [ ] **FIN-02**: FinanceCard is conditionally shown on Dashboard only when a cash shortfall is projected

### Responsive Layout

- [ ] **RESP-01**: Mobile (<768px): single-column layout, charts full-width, NavBar fixed at bottom
- [ ] **RESP-02**: Tablet (768–1024px): two-column layout (chart + insights side-by-side)
- [ ] **RESP-03**: Desktop (>1024px): three-column dashboard layout
- [ ] **RESP-04**: No horizontal scrolling on mobile; supplier table uses card-list layout on mobile

### Quality & Build

- [ ] **TEST-01**: 20 Vitest tests pass: applySimulation (5), reducer (4), CashFlowChart (3), InsightCard (4), SupplierList (4)
- [ ] **BUILD-01**: `vite build` produces clean `dist/` with no TypeScript or build errors
- [ ] **BUILD-02**: App deployable as static files (HashRouter, no server-side routing required)

## v2 Requirements

### Enhanced Features

- **V2-01**: Insight detail route `/insights/:id` with full AI reasoning deep-dive
- **V2-02**: Full loan application flow (beyond CTA card)
- **V2-03**: AI Control Settings panel (toggle AI features on/off)
- **V2-04**: Confirmed actions section showing history of approved insights
- **V2-05**: Inventory management view

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real API integrations (POS, bank feeds) | Prototype only — static mock data is sufficient for stakeholder demo |
| Backend AI/ML models | Rule-based mock logic adequate for demonstrating the concept |
| Real authentication | No auth needed for static shareable demo URL |
| Full loan application flow | CTA present but deep flow out of demo scope |
| Complex inventory management | Out of F&B banking co-pilot scope for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-01 | Phase 1 | Pending |
| TOOL-02 | Phase 1 | Pending |
| TOOL-03 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| NAV-01 | Phase 3 | Pending |
| NAV-02 | Phase 3 | Pending |
| NAV-03 | Phase 3 | Pending |
| CASH-01 | Phase 3 | Pending |
| CASH-02 | Phase 3 | Pending |
| CASH-03 | Phase 3 | Pending |
| INSG-01 | Phase 4 | Pending |
| INSG-02 | Phase 4 | Pending |
| INSG-03 | Phase 4 | Pending |
| INSG-04 | Phase 4 | Pending |
| INSG-05 | Phase 4 | Pending |
| SIM-01 | Phase 5 | Pending |
| SIM-02 | Phase 5 | Pending |
| SIM-03 | Phase 5 | Pending |
| SIM-04 | Phase 5 | Pending |
| SUPP-01 | Phase 4 | Pending |
| SUPP-02 | Phase 4 | Pending |
| SUPP-03 | Phase 4 | Pending |
| FIN-01 | Phase 4 | Pending |
| FIN-02 | Phase 4 | Pending |
| RESP-01 | Phase 3 | Pending |
| RESP-02 | Phase 3 | Pending |
| RESP-03 | Phase 3 | Pending |
| RESP-04 | Phase 4 | Pending |
| TEST-01 | Phase 5 | Pending |
| BUILD-01 | Phase 5 | Pending |
| BUILD-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after initial definition*
