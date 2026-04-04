# Project Research Summary

**Project:** SMB F&B AI Co-Pilot
**Domain:** React fintech dashboard prototype — AI-powered banking co-pilot for SMB F&B owners
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

This is a React 18 + TypeScript single-page application prototype demonstrating AI-powered cash flow management for small F&B business owners, built for demo presentation to IBM banking product stakeholders. The stack is fully locked: Vite 8, React 18, TypeScript 5, Fluent UI v9 (webDarkTheme), React Router v6 (HashRouter), Chart.js 4, and Vitest 4. All data is static mock — no backend, no API calls. The build must produce a deployable static `dist/` folder. A detailed 15-task implementation plan already exists and defines the full architecture, so this research is confirmatory and risk-focused rather than exploratory.

The recommended build approach follows a strict layered dependency chain: scaffold and tooling first, then shared types, then mock data, then pure utility functions, then the AppContext/useReducer state machine, then the app shell with routing, then individual UI components (in order of demo value), and finally screen composition. The Simulate screen's reactive chart update — where a slider change immediately redraws the forecast — is the technical centrepiece and depends on `applySimulation` being a pure synchronous function whose output is derived during render, not stored in state. This pattern must be established before the SimulatorPanel component is built.

The top risks are all solvable and well-understood: React Router v7 is now the `npm install` default (must pin `^6`), TypeScript 6 is now the npm default (must pin `^5`), Chart.js v4 requires explicit component registration (missing `Filler` silently breaks confidence bands), Chart.js crashes in jsdom without a canvas mock (test suite dead on arrival), and Fluent UI v9 renders unstyled if `FluentProvider` is not at the root of the provider tree in `main.tsx`. All five of these are configuration decisions made once at scaffold time. Get them right in Phase 1 and the rest of the build is low-risk.

---

## Key Findings

### Recommended Stack

The stack is locked and verified against the npm registry as of 2026-04-03. Every version pin is intentional: `react-router-dom@^6` because the `latest` tag now points to v7 (breaking rewrite); `typescript@^5` because TypeScript 6 breaks Fluent UI v9's internal types; `@vitejs/plugin-react@^6` because v6 requires Vite 8 and the older plugin does not work with Vite 8's Rolldown internals. Node.js must be `^20.19.0 || >=22.12.0` (Vite 8 engine requirement).

The test infrastructure requires three non-obvious setup steps that must be completed at scaffold time: (1) `jest-canvas-mock` imported before any chart import in `setup.ts`, (2) a `ResizeObserver` no-op polyfill for Fluent UI components in jsdom, and (3) `vitest/globals` types added to `tsconfig.json`. Skipping any of these causes the test suite to fail before a single meaningful test is written.

**Core technologies:**
- `react@^18.3.1` + `react-dom@^18.3.1`: UI rendering — React 19 is now npm `latest`; must pin `^18`
- `@fluentui/react-components@^9.73.7` + `webDarkTheme`: Enterprise visual credibility; `FluentProvider` is mandatory at app root
- `react-router-dom@^6.30.3` (HashRouter): Static deployment routing — npm `latest` is v7; must pin `^6`
- `chart.js@^4.5.1` + `react-chartjs-2@^5.3.1`: Cash flow forecast chart with confidence bands; explicit component registration required
- `vite@^8.0.3` + `@vitejs/plugin-react@^6.0.1`: Build tooling; Rolldown-based bundler internally
- `vitest@^4.1.2` + `@testing-library/react@^16.3.2`: Test suite; target 20 passing tests
- `typescript@^5.9.3`: npm `latest` is now TypeScript 6; must pin `^5`

### Expected Features

All features are pre-defined in `PROJECT.md`. The research confirms priority order and identifies the single highest-leverage visual: the cash flow chart with confidence bands. Stakeholders will judge the entire prototype on this chart in the first 10 seconds.

**Must have (table stakes):**
- Cash flow forecast chart: current balance + 14-day forecast line + confidence band shading + today marker + zero baseline
- Shortfall warning MessageBar: specific date and amount ("Projected shortfall of $1,240 on Apr 18")
- AI Insights Panel with ranked cards: severity badge + action headline + "Why this?" expandable reasoning + Approve/Dismiss
- Supplier Payment list: supplier name, amount, due date, priority badge, AI recommendation per row
- Approve/Dismiss actions wired to AppContext state (interactive prototype, not static mockup)
- Responsive layout: mobile single-column, tablet two-column, desktop three-column
- Currency formatting (`Intl.NumberFormat`) and color-coded positive/negative numbers (universal fintech convention)
- Loading/empty states for every data zone (Fluent UI Skeleton)

**Should have (differentiators):**
- Confidence band fill (`fill: '+1'` between upper/lower bound datasets) — the single most powerful AI trust signal
- "Why this?" three-part reasoning: signal + causal chain + projected outcome if acted
- Delta indicator on Simulator: "Without changes: shortfall of $1,240 | With your changes: surplus of $420"
- Contextual Financing Card: renders only when forecast goes negative — conditional, not always visible
- Scenario named presets (3 one-click buttons: "Delay all payments", "Take minimum loan", "Worst case")
- Priority badge gradient in Supplier list: Urgent (red) / High (amber) / Normal (grey) / Low (teal)
- Dismiss with undo toast ("Dismissed — Undo") — builds stakeholder trust in AI recommendations

**Defer (v2+ or time permitting):**
- Undo toast for Dismiss — nice but not critical for prototype
- Animated delta transitions on simulator
- `/insights/:id` detail route — optional per PRD
- Full loan application form — CTA present; show "coming soon" toast instead

**Anti-features (explicitly do not build):**
- Animated number counters (count-up effect): adds perceived latency, no value
- Pie/donut charts: weak for comparison, common fintech antipattern
- Auto-refresh or polling animations: signals deception in a static prototype
- Infinite scroll for insights: 4 pre-authored cards need no pagination

### Architecture Approach

The architecture is a unidirectional data flow SPA: static mock files seed `initialState`, which flows into `AppContext` via `useReducer`, which Screens read and pass down as typed props to display Components. Components are pure display units — they never call `useAppContext` directly. Screens own all context reads and dispatch callbacks. This strict boundary makes every component testable without a provider wrapper. The Simulate screen's reactive chart update is a pure synchronous derivation: `applySimulation(state.forecast, state.simulation)` is called during render and its result passed directly as a prop to `CashFlowChart`. No `useEffect`, no imperative chart manipulation, no state stored for derived values.

**Major components:**
1. `AppContext` + `reducer.ts` — global state machine; actions: `APPROVE_INSIGHT`, `DISMISS_INSIGHT`, `SET_SIMULATION`
2. `CashFlowChart` — Chart.js `<Line>` wrapped in react-chartjs-2; accepts `forecast: ForecastData[]` as prop; owns Chart.js registration
3. `InsightCard` — ranked AI recommendation card; accepts `insight: Insight`, emits `onApprove(id)` / `onDismiss(id)`
4. `SimulatorPanel` — Fluent UI Switch + Slider controls; accepts `simulation: SimulationState`, emits `onChange(SimulationState)`
5. `SupplierList` — styled table with priority badges; accepts `suppliers: Supplier[]`
6. `FinanceCard` — conditional loan suggestion; renders only when shortfall detected
7. `applySimulation` pure utility — no React dependencies; core reactive mechanic; independently testable
8. Screens: `Dashboard`, `Simulate`, `Payments` — compose components, read context, own dispatch

### Critical Pitfalls

1. **FluentProvider missing or misplaced** — Fluent UI v9 components render without styling (flat grey boxes, no dark theme tokens) when `FluentProvider` is not the outermost wrapper in `main.tsx`. It must be outside `HashRouter` so portalled components (Tooltip, Dialog) also inherit tokens. Silent failure — no console error.

2. **React Router v7 installed instead of v6** — Running `npm install react-router-dom` without a version specifier installs v7 (breaking rewrite, removes `HashRouter` in some configurations). Always install with `react-router-dom@^6`. Same risk applies to TypeScript (`^5` required, `^6` is now npm `latest`) and React (`^18` required, v19 is now npm `latest`).

3. **Chart.js component registration omitted** — Chart.js v4 requires explicit `ChartJS.register(...)` at module scope before the first render. Missing `Filler` plugin registration makes the confidence band fill silently produce no shading. Missing `CategoryScale` or `LinearScale` throws a runtime error. Register all required elements in `CashFlowChart.tsx` at module level.

4. **Canvas mock absent in Vitest test setup** — jsdom does not implement the Canvas API. Any test rendering a component with `<Line>` from react-chartjs-2 crashes with `HTMLCanvasElement.prototype.getContext is not a function`. Add `import 'jest-canvas-mock'` as the first line of `src/test/setup.ts`. Without this, the entire chart test suite is dead on arrival.

5. **useReducer state mutation (silent re-render failure)** — Mutating state objects in place inside the reducer (e.g., `insight.status = 'approved'` then `return state`) causes React to see the same reference and skip re-renders. Approve/Dismiss actions dispatch but InsightCard badges never update. Every reducer `case` must return `{ ...state, field: newValue }`. Add `readonly` modifiers to `AppState` type to get compile-time enforcement.

6. **react-chartjs-2 stale chart on simulation change** — Passing the same object reference for `chartData` between renders causes react-chartjs-2 to skip the chart update even when simulation state changes. `applySimulation` must return a new array each call. Wrap `chartData` construction in `useMemo` with simulation state as dependency.

---

## Implications for Roadmap

The 15-task implementation plan already defines the full build sequence. The research confirms this sequence is correct and adds risk context per phase. Suggested phases follow the architectural dependency chain.

### Phase 1: Scaffold, Tooling, and Provider Tree

**Rationale:** Every subsequent phase depends on correct tooling configuration. Version pins, test infrastructure, and the `FluentProvider` + `HashRouter` provider tree must be correct before any component is written. Mistakes here (wrong React Router version, missing canvas mock, misplaced FluentProvider) cascade through the entire build.

**Delivers:** Working Vite 8 scaffold with Vitest passing, `FluentProvider` wrapping the app in `main.tsx`, HashRouter routing with stub screens, confirmed dark theme rendering.

**Addresses:** Table stakes — layout skeleton, accessible dark theme foundation.

**Avoids:** Pitfalls 1 (FluentProvider placement), 2 (Chart.js registration — canvas mock set up), 3 (canvas mock in jsdom), 12 (jest-dom Vitest matchers — `globals: true` set), version pin mistakes (react-router-dom, TypeScript, React).

**Tasks:** 1 (scaffold + dependencies), 2 (types), 3 (FluentProvider + routing), 4 (AppContext + reducer), 5 (NavBar + mock data).

### Phase 2: Core State Machine and Pure Utilities

**Rationale:** The reducer, AppContext, and `applySimulation` are the engine of the prototype. They have no React rendering dependencies and can be fully tested before any component exists. Building and verifying these first ensures the interactive mechanics (approve/dismiss, scenario simulation) are correct before wiring up the UI.

**Delivers:** `AppContext` with `useReducer`, all 3 action types, typed `AppState`, `applySimulation` pure function, `useSimulatedForecast` hook, passing unit tests for reducer and simulation utility.

**Addresses:** `APPROVE_INSIGHT`, `DISMISS_INSIGHT`, `SET_SIMULATION` actions; pure reactive simulation mechanic.

**Avoids:** Pitfall 4 (useReducer mutation — enforce immutability and `readonly` types here).

**Tasks:** 4 (AppContext + reducer), 6 (pure `applySimulation` utility).

### Phase 3: Cash Flow Chart Component

**Rationale:** The chart is the highest-impact visual in the prototype. Stakeholders judge the product on this in the first 10 seconds. It is also the technically most complex component (Chart.js registration, confidence band fill, today marker). Building it first establishes the chart mock pattern used by all subsequent tests.

**Delivers:** `CashFlowChart` component rendering historical line, forecast dashed line, confidence band fill, today vertical marker, zero baseline, shortfall MessageBar, currency-formatted axes.

**Addresses:** Cash flow forecast with confidence bands (top differentiator), shortfall warning MessageBar.

**Avoids:** Pitfall 2 (Chart.js registration — `Filler` plugin required for confidence band fill), Pitfall 8 (stale chart reference — `useMemo` on chartData).

**Tasks:** 7 (CashFlowChart component + CashFlowChart.test.tsx).

### Phase 4: AI Insights Panel

**Rationale:** The AI narrative is the conceptual core of the demo. `InsightCard` with "Why this?" expandable reasoning is what differentiates this from a static balance display. Approve/Dismiss wires the component to AppContext, proving the prototype is interactive.

**Delivers:** `InsightCard` with severity badge, action headline, "Why this?" Accordion expand (signal + cause + outcome structure), Approve/Dismiss buttons wired to `handleApprove`/`handleDismiss` in Dashboard screen.

**Addresses:** AI Insights Panel, "Why this?" reasoning (top differentiator), Approve/Dismiss interactivity.

**Avoids:** Pitfall 7 (TypeScript `mergeClasses` with boolean — use ternary, never `&&`), Pitfall 9 (async `act()` in tests — use `userEvent` + `async/await`), Pitfall 10 (use Fluent `Accordion` not raw `<details>`).

**Tasks:** 8 (InsightCard component + InsightCard.test.tsx).

### Phase 5: Supplier List and Payments Screen

**Rationale:** The Payments screen is a self-contained display surface with no complex state interaction. `SupplierList` is the lowest-complexity component after `FinanceCard`. Building it here makes the Payments route functional and completes the three-screen navigation.

**Delivers:** `SupplierList` with supplier name, amount, due date, priority badge (Urgent/High/Normal/Low with Fluent semantic tokens), AI recommendation per row, Payments screen functional.

**Addresses:** Supplier Payment Optimizer (table stakes for cash management demo).

**Avoids:** Pitfall 5 (CSS tokens — priority badge colors must use Fluent semantic color tokens, not hardcoded hex).

**Tasks:** 9 (SupplierList component), 10 (Payments screen).

### Phase 6: Cashflow Simulator and Reactive Chart

**Rationale:** The simulator is the "wow" moment of the demo — direct manipulation of sliders causes the chart to redraw in real time. This phase depends on `applySimulation` (Phase 2) and `CashFlowChart` (Phase 3). It is last among core features because it is the most dependent.

**Delivers:** `SimulatorPanel` with Switch (delay payment toggle) and Slider (delay days, loan amount), real-time chart update via `useSimulatedForecast`, delta indicator strip ("Without changes: shortfall of $1,240 | With your changes: surplus of $420"), Simulate screen functional, 3 preset scenario buttons.

**Addresses:** Cashflow Simulator (differentiator), real-time chart update requirement, delta indicator (high demo value).

**Avoids:** Pitfall 4 (anti-pattern 2: do not store derived forecast in state — derive synchronously during render), Pitfall 8 (stale chart reference — `applySimulation` must return new array), Pitfall 13 (Slider `(_ev, data)` destructuring), Pitfall 14 (Switch must be controlled).

**Tasks:** 11 (SimulatorPanel + Simulate screen), 12 (delta indicator).

### Phase 7: Financing Card, Responsive Layout, and Polish

**Rationale:** `FinanceCard` is the lowest-complexity component (static copy, one CTA). Responsive layout and polish complete the demo narrative. This phase is the final one because it has no blockers and its primary value is presentation quality rather than functionality.

**Delivers:** `FinanceCard` rendering conditionally when forecast goes negative (positioned below MessageBar, above InsightPanel), mobile bottom tab navigation, responsive grid breakpoints (mobile/tablet/desktop), contextual shortfall-triggered financing prompt.

**Addresses:** Contextual Financing Card (differentiator — conditional not always visible), responsive layout (mobile-first requirement), bottom tab navigation on mobile.

**Avoids:** Pitfall 5 (CSS Modules use Fluent token CSS custom properties for all color/spacing — no hardcoded hex), Pitfall 6 (set `base: './'` in `vite.config.ts` for sub-path deployment on GitHub Pages).

**Tasks:** 13 (FinanceCard), 14 (responsive layout), 15 (production build + deploy verification).

### Phase 8: Test Suite Completion and Build Verification

**Rationale:** Tests are written alongside components in phases 2–7, but this phase ensures all 20 tests pass, `vite build` produces a clean `dist/`, and the deployment base URL is correct.

**Delivers:** 20 passing Vitest tests, clean `vite build` output, `dist/` ready for Vercel or GitHub Pages deployment.

**Addresses:** Vitest test suite (20 passing tests) and production static build requirements.

**Avoids:** Pitfall 6 (Vite `base` URL for sub-path deployment — set before `vite build`).

**Tasks:** Integrated into phases 2–7; final verification pass.

### Phase Ordering Rationale

- Scaffold first because version pin mistakes (React Router v7, TypeScript 6) cascade through everything and are expensive to undo.
- State machine before UI because `applySimulation` and the reducer can be fully unit-tested before any React rendering — this gives high confidence in the core logic.
- Chart before Insights because CashFlowChart is the highest-value visual and its test mock pattern is reused in SimulatorPanel tests.
- Simulator last among core features because it depends on both `applySimulation` (Phase 2) and `CashFlowChart` (Phase 3) being solid.
- FinanceCard and responsive layout last because they are presentation layer with no functional blockers.

### Research Flags

Phases with standard patterns (skip research-phase during planning — patterns are well-documented and confirmed):
- **Phase 1 (Scaffold):** Vite 8 + React 18 setup is standard; version pins are documented in STACK.md.
- **Phase 2 (State Machine):** `useReducer` + `useContext` is canonical React — no novel patterns.
- **Phase 3 (Chart):** Chart.js v4 confidence band pattern is fully documented in FEATURES.md with exact dataset configuration.
- **Phase 4 (Insights):** Fluent UI `Accordion` for expandable content is standard usage.
- **Phase 5 (Supplier List):** Styled table with Fluent semantic color tokens — no novel patterns.

Phases that may benefit from a targeted research spike during planning:
- **Phase 6 (Simulator — delta indicator):** The delta summary strip ("Without changes / With your changes") requires deriving a diff between base and simulated forecast. The calculation pattern is straightforward, but the visual placement and the exact diff format should be confirmed against the implementation plan before building.
- **Phase 7 (Responsive layout breakpoints):** The three-breakpoint grid (640px / 1024px) is confirmed in FEATURES.md and ARCHITECTURE.md, but mobile bottom tab navigation with Fluent UI v9 has no dedicated component — a custom implementation is needed. Confirm approach before building.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified directly against npm registry on 2026-04-03. Version pin rationale is confirmed (React Router v7 as `latest`, TypeScript 6 as `latest`, React 19 as `latest`). |
| Features | HIGH | Chart.js `fill: '+1'` confidence band pattern is stable API (v3/v4). "Why this?" XAI pattern (signal + cause + outcome) is established in XAI research. Fintech color conventions are universal. Delta indicator pattern is MEDIUM — strong inference from financial planning tools, not formally documented. |
| Architecture | HIGH | Architecture derived directly from the existing 15-task implementation plan. Unidirectional data flow, Screen/Component boundary, synchronous `applySimulation` derivation are all confirmed patterns from React docs and the implementation plan. |
| Pitfalls | HIGH | All critical pitfalls are based on officially documented library behavior (FluentProvider requirement, Chart.js v3+ registration, jsdom canvas limitation, React immutability, Vite base URL). No speculative pitfalls included. |

**Overall confidence:** HIGH

### Gaps to Address

- **Mobile bottom tab navigation implementation:** Fluent UI v9 has no built-in `BottomTabBar` component. The navigation must be custom-implemented using Fluent tokens and CSS. Confirm the approach (likely a `TabList` or custom `nav` with Fluent styling) before Phase 7 begins.

- **Delta indicator exact format:** The diff strip for the Simulate screen ("Without changes: shortfall of $1,240 on Apr 18 | With your changes: surplus of $420 on Apr 18") requires a helper that identifies the min balance date and amount from both base and simulated forecasts. Confirm the exact data shape needed before Phase 6 begins.

- **Vite `base` URL for deployment target:** Whether to use `base: './'` (relative, works everywhere) or `base: '/smb-fnb-ai-copilot/'` (absolute, specific to GitHub Pages) depends on the final deployment target. Confirm before Phase 8 / production build.

- **Conditional FinanceCard trigger:** The card should render when `forecast.minBalance < 0`. The exact field name (`minBalance`, `shortfallAmount`, or derived from the data array) must be confirmed against the mock data schema in the implementation plan before Phase 7.

---

## Sources

### Primary (HIGH confidence)

- npm registry direct queries (2026-04-03) — all package versions, peer deps, engine requirements, dist-tags verified
- `docs/superpowers/plans/2026-04-02-smb-fnb-ai-copilot.md` — authoritative 15-task implementation plan; all architecture patterns derived from this document
- `.planning/PROJECT.md` — locked stack, constraints, requirements, out-of-scope decisions
- React 18 official documentation — `useReducer` + `useContext` unidirectional data flow patterns
- Chart.js v4 official documentation — tree-shaking registration, `Filler` plugin, `fill: '+1'` between datasets

### Secondary (MEDIUM confidence)

- Established fintech dashboard patterns (Mercury, Brex, Revolut, Wise, Xero, QuickBooks) — feature priority, UX conventions, color semantics, contextual financing card positioning
- DARPA XAI program / Nielsen Norman Group AI trust research — "Why this?" three-part XAI pattern (signal + cause + outcome)
- Fluent UI v9 CSS-in-JS (Griffel) + CSS Modules coexistence — CSS Modules manage layout; Fluent handles tokens (training data; verify if token variable names change between minor versions)

### Tertiary (LOW confidence / inference)

- Delta indicator visual format — inferred from financial planning tool patterns; not formally documented
- Mobile bottom tab navigation with Fluent UI v9 — no dedicated component; custom implementation approach inferred from Fluent token usage patterns

---

*Research completed: 2026-04-03*
*Ready for roadmap: yes*
