# SMB F&B AI Co-Pilot

## What This Is

A React + TypeScript prototype of an AI-powered banking co-pilot for small F&B business owners (cafés, hawkers, small restaurants). It shows how a banking app can move beyond transaction history to proactively predict cash flow, surface actionable AI insights, simulate financial scenarios, and support supplier payment decisions — all driven by static mock data, no backend required.

## Core Value

An F&B owner can see a projected cash shortfall before it happens, understand exactly why the AI is recommending an action, and make a confident decision — without needing financial training.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Cash flow chart displaying current balance + 14-day forecast with confidence bands
- [ ] Shortfall warning via MessageBar when projected balance goes negative
- [ ] AI Insights Panel with ranked recommendations (delay payment, reduce inventory, financing)
- [ ] "Why this?" expandable reasoning section per insight
- [ ] Approve / Dismiss actions on each insight
- [ ] Scenario Simulator with Switch + Slider controls (delay payment, loan amount)
- [ ] Real-time chart update when simulation parameters change
- [ ] Supplier Payment list with AI recommendations and priority badges
- [ ] Contextual Financing Card (non-intrusive loan suggestion)
- [ ] Responsive layout: mobile single-column, tablet two-column, desktop three-column
- [ ] Bottom tab navigation on mobile; top nav on desktop
- [ ] HashRouter routing: `/` Dashboard, `/simulate` Simulate, `/payments` Payments
- [ ] All data from static mock files (no API calls)
- [ ] AppContext + useReducer global state with APPROVE_INSIGHT, DISMISS_INSIGHT, SET_SIMULATION actions
- [ ] Pure `applySimulation` function for reactive forecast computation
- [ ] Vitest test suite (20 passing tests)
- [ ] Production static build via `vite build`

### Out of Scope

- Real API integrations (POS, accounting, bank feeds) — prototype only, mock data sufficient
- Full loan application flow — CTA present but deep flow not built
- Complex inventory management — out of demo scope
- Backend AI/ML models — rule-based mock logic only
- Real authentication — no auth needed for static demo
- `/insights/:id` detail route — optional per PRD, deferred

## Context

- IBM project: demonstrating how SMB banking apps can evolve from reactive to proactive
- Target demo audience: banking product stakeholders, not end users — clarity of concept matters
- Users check balances daily on mobile; mobile-first responsive design is important
- Fluent UI v9 (`webDarkTheme`) chosen for enterprise/banking-grade visual credibility
- The demo narrative: "moves beyond transactions to become a daily decision-making tool"
- Detailed 15-task implementation plan already exists at `docs/superpowers/plans/2026-04-02-smb-fnb-ai-copilot.md`

## Constraints

- **Tech Stack**: Vite + React 18 + TypeScript 5 + Fluent UI v9 + React Router v6 (HashRouter) + Chart.js — locked per PRD
- **Data**: Static mock only — no network calls, no backend
- **Deployment**: Static file hosting (Vercel / GitHub Pages) — build must produce deployable `dist/`
- **Styling**: CSS Modules for layout; Fluent UI design tokens for component styles — no Tailwind
- **State**: `useContext` + `useReducer` only — no Redux, no Zustand

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fluent UI v9 webDarkTheme | Enterprise/banking credibility; accessibility-first; rich component set | — Pending |
| HashRouter over BrowserRouter | Static deployment without server-side routing config | — Pending |
| Static mock data (no API) | Prototype speed; stakeholder demo doesn't need live data | — Pending |
| useReducer over Redux/Zustand | Sufficient for single-screen app state; no extra dependencies | — Pending |
| Pure `applySimulation` fn | Enables reactive chart updates without side effects; testable | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 after initialization*
