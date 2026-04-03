# Architecture Patterns

**Domain:** React fintech dashboard SPA — SMB F&B AI Co-Pilot banking prototype
**Researched:** 2026-04-03
**Confidence:** HIGH — architecture derived directly from the existing implementation plan, types, and code patterns; no speculation required

---

## Recommended Architecture

The architecture is a single-page React 18 application with a strict unidirectional data flow:

```
Static Mock Files
       │
       ▼
 initialState (reducer.ts)
       │
       ▼
  AppContext (useReducer)
       │
   ┌───┴────────────────────────────────┐
   │                                    │
   ▼                                    ▼
Screens (read state)             dispatch(action)
(Dashboard, Simulate, Payments)        │
   │                                   │
   │  pass props down                  │ returned from useAppContext()
   ▼                                    ▼
Components (pure / display)       reducer.ts → new AppState
(CashFlowChart, InsightCard,
 SupplierList, SimulatorPanel,
 FinanceCard, NavBar)

Simulator path:
  state.simulation + state.forecast
          │
          ▼
  applySimulation() — pure fn, no side effects
          │
          ▼
  simulatedForecast (derived, not stored)
          │
          ▼
  CashFlowChart receives as prop
```

---

## Component Boundaries

### Division: Screens vs Components

**Screens** are route-level containers. They own context reads and prop distribution. No display logic. No styles beyond grid layout.

**Components** are display units. They receive typed props, emit callbacks, own their own CSS Module. They never call `useAppContext` directly — the screen passes what they need.

| Layer | Reads Context | Dispatches Actions | Has Display Logic | Has CSS Module |
|-------|--------------|-------------------|-------------------|----------------|
| Screens | YES | YES (via callbacks passed to components) | NO | YES (grid layout only) |
| Components | NO | NO | YES | YES |

**Rationale:** This boundary makes components independently testable without wrapping in providers. Tests render `<InsightCard insight={...} onApprove={fn} onDismiss={fn} />` directly — no context needed. This is the pattern demonstrated in the implementation plan's test suite.

**Exception — NavBar:** NavBar uses `useNavigate` and `useLocation` from React Router. These are navigation primitives, not app state, and there is no practical benefit to threading router state through props. NavBar reads router context directly.

### Component Responsibility Map

| Component | Inputs (props) | Outputs (callbacks) | Side Effects |
|-----------|---------------|---------------------|--------------|
| NavBar | none | none | navigate() on tab select |
| CashFlowChart | forecast: ForecastData[] | none | renders Chart.js canvas |
| InsightCard | insight: Insight | onApprove(id), onDismiss(id) | none |
| SupplierList | suppliers: Supplier[] | none | none |
| SimulatorPanel | simulation: SimulationState | onChange(SimulationState) | none |
| FinanceCard | none (static copy) | none | none |

### Screen Responsibility Map

| Screen | Components Rendered | Context Reads | Actions Dispatched |
|--------|-------------------|---------------|-------------------|
| Dashboard | CashFlowChart, InsightCard×N, FinanceCard | forecast, insights, simulation | APPROVE_INSIGHT, DISMISS_INSIGHT |
| Simulate | CashFlowChart, SimulatorPanel | forecast, simulation | SET_SIMULATION |
| Payments | SupplierList, FinanceCard | suppliers | none |

---

## Data Flow Patterns

### Pattern 1: Reactive Simulation (the core demo mechanic)

The Simulate screen owns the entire simulation loop. No async, no effects required.

```typescript
// src/screens/Simulate/Simulate.tsx
function Simulate() {
  const { state, dispatch } = useAppContext()

  // Pure derivation — runs synchronously on every render
  const simulatedForecast = applySimulation(state.forecast, state.simulation)

  return (
    <>
      <SimulatorPanel
        simulation={state.simulation}
        onChange={(sim) => dispatch({ type: 'SET_SIMULATION', simulation: sim })}
      />
      <CashFlowChart forecast={simulatedForecast} />
    </>
  )
}
```

Key points:
- `applySimulation` is called during render, not in a useEffect. This is correct — it is a pure synchronous transformation.
- `simulatedForecast` is a derived value, not stored in state. It lives only for the render cycle.
- Chart updates are driven by React's normal re-render cycle. No imperative chart manipulation.
- `useSimulatedForecast` hook (defined in the file map) is a thin wrapper around this pattern if you want to name the derivation clearly.

```typescript
// src/hooks/useSimulatedForecast.ts
import { useAppContext } from '../context/AppContext'
import { applySimulation } from '../utils/simulateForecast'

export function useSimulatedForecast() {
  const { state } = useAppContext()
  return applySimulation(state.forecast, state.simulation)
}
```

This hook is safe because `applySimulation` is pure — the hook has no side effects, no subscriptions, no cleanup needed.

### Pattern 2: Action Dispatch from Screen

```typescript
// Dashboard.tsx — the screen owns dispatch, passes callbacks
const { state, dispatch } = useAppContext()

const handleApprove = (id: string) =>
  dispatch({ type: 'APPROVE_INSIGHT', id })

const handleDismiss = (id: string) =>
  dispatch({ type: 'DISMISS_INSIGHT', id })

// Rendered:
{state.insights.map(insight => (
  <InsightCard
    key={insight.id}
    insight={insight}
    onApprove={handleApprove}
    onDismiss={handleDismiss}
  />
))}
```

Avoid passing `dispatch` directly to components. Screen-level handler functions clarify intent and keep action creators out of display components.

### Pattern 3: State Seeding from Mock Files

```typescript
// src/context/reducer.ts
import { mockForecast } from '../mock/forecast'
import { mockInsights } from '../mock/insights'
// ...

export const initialState: AppState = {
  balance: 8200,
  forecast: mockForecast,
  insights: mockInsights,
  suppliers: mockSuppliers,
  transactions: mockTransactions,
  simulation: {
    delayPaymentEnabled: false,
    delayDays: 5,
    loanEnabled: false,
    loanAmount: 3000,
  },
}
```

Mock files are plain TypeScript modules exporting typed arrays. No async loading, no fetch, no useEffect on mount. State is synchronously available from the first render. This eliminates an entire class of loading-state complexity.

---

## CSS Module Patterns with Fluent UI v9

### The Two-Layer Styling Model

Fluent UI v9 uses a Griffel-based CSS-in-JS system internally. CSS Modules and Fluent UI coexist without conflict because they operate at different levels:

- **CSS Modules** — own structural concerns: layout, spacing, positioning, responsive breakpoints, wrapper dimensions. Applied to `div`, `section`, `nav` container elements.
- **Fluent UI tokens** — own visual concerns: color, typography, border-radius, elevation. Applied via Fluent UI component props and `makeStyles` when customising Fluent components.

### Do Not Fight Fluent UI's Styles

Never use CSS Modules to override Fluent UI component internals (Button color, Card background, etc). Fluent UI v9 provides override mechanisms — use `style` props, `className` composition via `mergeClasses`, or `makeStyles` from `@fluentui/react-components`.

### Correct Pattern

```css
/* InsightCard.module.css */
/* CSS Module ONLY handles structure */
.card {
  margin-bottom: 12px;
}

.footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.reasoningText {
  opacity: 0.75;
  font-size: 13px;
  line-height: 1.5;
}
```

```tsx
/* InsightCard.tsx — Fluent components get Fluent props */
import styles from './InsightCard.module.css'
import { Card, CardFooter, Badge, Button } from '@fluentui/react-components'

<Card className={styles.card}>
  <CardFooter className={styles.footer}>
    <Button appearance="primary" onClick={() => onApprove(insight.id)}>Approve</Button>
    <Button appearance="subtle" onClick={() => onDismiss(insight.id)}>Dismiss</Button>
  </CardFooter>
</Card>
```

### Responsive Layout via CSS Modules

Screens own the grid. CSS Modules are the right tool for breakpoints:

```css
/* Dashboard.module.css */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: 2fr 1fr;
  }
}
```

Fluent UI's design tokens are CSS custom properties. For the dark theme, they resolve on the `FluentProvider` element via `data-fluent-theme`. Do not duplicate token values as hardcoded hex strings in CSS Modules — reference them only when necessary.

```css
/* When you must reference a token in a CSS Module (rare) */
.highlight {
  color: var(--colorBrandForeground1);
  border-left: 3px solid var(--colorBrandStroke1);
}
```

The preferred approach: use Fluent UI `tokens` object in `makeStyles` or inline `style` prop for token-based values, and keep CSS Modules free of token references.

---

## Build Order Dependencies

The following dependency chain must be respected. Each layer can only be built after its foundation is ready.

```
Layer 0: Scaffold + Tooling
  Vite config, Vitest config, package.json, tsconfig.json
  → Required by: everything

Layer 1: Types (src/types.ts)
  All shared TypeScript types
  → Required by: mock files, context, all components

Layer 2: Mock Data (src/mock/*.ts)
  Typed static arrays
  → Required by: reducer (initialState), tests

Layer 3: Pure Utilities (src/utils/simulateForecast.ts)
  No React dependencies — pure TypeScript
  → Required by: useSimulatedForecast hook, Simulate screen
  → Tests can run immediately after this layer (no React needed)

Layer 4: Reducer + Context (src/context/reducer.ts, AppContext.tsx)
  useReducer state machine
  → Required by: all screens, useSimulatedForecast hook
  → Reducer tests can run without React render

Layer 5: App Shell (main.tsx, App.tsx, App.module.css)
  Provider tree: HashRouter > FluentProvider > AppProvider > App
  NavBar component
  Stub screens
  → Required by: visual verification of routing

Layer 6: Components (in any order, they are independent)
  CashFlowChart → depends on: chart.js, react-chartjs-2, Fluent UI MessageBar
  InsightCard   → depends on: Fluent UI Card, Accordion, Badge, Button
  SupplierList  → depends on: Fluent UI DataGrid or Table, Badge
  SimulatorPanel → depends on: Fluent UI Switch, Slider
  FinanceCard   → depends on: Fluent UI Card, Button

Layer 7: Screens (compose components, read context)
  Dashboard → depends on: CashFlowChart, InsightCard, FinanceCard
  Simulate  → depends on: CashFlowChart, SimulatorPanel, useSimulatedForecast
  Payments  → depends on: SupplierList, FinanceCard

Layer 8: Integration + Test Completion
  All component tests pass
  Full test count reaches 20
  vite build produces dist/
```

Within Layer 6, build order recommendation based on demo value and test dependency:

1. **CashFlowChart first** — highest visual impact, core demo mechanic, tests establish the chart mock pattern used by all other chart tests
2. **InsightCard second** — key AI narrative, tests exercise the approve/dismiss flow
3. **SupplierList third** — Payments screen becomes functional
4. **SimulatorPanel fourth** — unlocks the Simulate screen with reactive charts
5. **FinanceCard last** — static copy, lowest complexity, no state interaction

---

## Test Architecture for React Components with Mocked Chart Libraries

### The Chart.js + jsdom Problem

Chart.js requires a real canvas element. jsdom (Vitest's browser environment) does not implement the Canvas API. Any test that renders a Chart.js component without mocking will throw:

```
Error: "canvas" tag is not supported in this environment
```

### Solution: Module-Level vi.mock

Mock the entire `react-chartjs-2` module at the test file level. Replace `Line` (or `Bar`, `Doughnut` etc.) with a minimal div that surfaces the data passed to it:

```typescript
// src/test/CashFlowChart.test.tsx

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="line-chart">{data.labels.join(',')}</div>
  ),
}))
```

This mock:
- Eliminates the canvas requirement
- Exposes the data structure via `data-testid` for assertions
- Does not test Chart.js internals (which is correct — that is Chart.js's responsibility)
- Keeps tests focused on: "did the component pass the right data?" and "did the right UI elements appear?"

### What to Test in Chart-Containing Components

Test the component's logic, not Chart.js rendering:

```typescript
// CORRECT: Test what the component decides to render
it('renders shortfall warning when any projected balance is below zero', () => {
  render(<CashFlowChart forecast={mockForecast} />)
  expect(screen.getByText(/shortfall/i)).toBeInTheDocument()
})

// CORRECT: Test that data reaches the chart
it('renders a chart with forecast date labels', () => {
  render(<CashFlowChart forecast={mockForecast} />)
  expect(screen.getByTestId('line-chart').textContent).toContain('2024-01-15')
})

// WRONG: Do not test Chart.js config objects or canvas state
```

### Testing Components That Dispatch Actions

For components that need context (`InsightCard` receives callbacks but does not call context directly — good). If a component must be tested with context, wrap in a test provider:

```typescript
// Test helper — create once, reuse
function renderWithProvider(ui: React.ReactElement, initialOverrides?: Partial<AppState>) {
  const TestProvider = ({ children }: { children: ReactNode }) => {
    const state = { ...defaultInitialState, ...initialOverrides }
    const [s, dispatch] = useReducer(appReducer, state)
    return (
      <AppContext.Provider value={{ state: s, dispatch }}>
        {children}
      </AppContext.Provider>
    )
  }
  return render(ui, { wrapper: TestProvider })
}
```

However: because Screens own context reads and pass props down to Components, most component tests do not need this. Components receive typed props — test them with props directly.

### Test File Structure

```
src/test/
  setup.ts                    — @testing-library/jest-dom import
  simulateForecast.test.ts    — pure function tests (no React, fast)
  reducer.test.ts             — pure function tests (no React, fast)
  CashFlowChart.test.tsx      — component test with chart mock
  InsightCard.test.tsx        — component test with callback assertions
  SupplierList.test.tsx       — component test for list rendering
```

Pure function tests (`simulateForecast`, `reducer`) have zero setup overhead — no rendering, no mocks. Build these first. They validate the core logic before any UI is rendered.

### Vitest + React Testing Library Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                        // vi, describe, it, expect available globally
    environment: 'jsdom',                 // DOM APIs available
    setupFiles: './src/test/setup.ts',    // jest-dom matchers registered
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

No additional configuration needed for CSS Modules — Vite handles them natively in test mode.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Components Reading AppContext Directly

**What:** A leaf component calls `useAppContext()` to get data.

**Why bad:** The component becomes untestable without a provider wrapper. It also couples the component to the global state shape — if AppState changes, every component that reads it breaks.

**Instead:** Screens read context. Components receive typed props. Components are reusable across any context or no context.

### Anti-Pattern 2: Storing Derived State in AppState

**What:** Computing `simulatedForecast` in a useEffect and storing the result back into state via dispatch.

**Why bad:** Creates a two-step state update (simulation changes → effect fires → new dispatch → re-render). Introduces potential stale state. Requires cleanup logic. Adds complexity for zero benefit.

**Instead:** Derive synchronously during render. `applySimulation(state.forecast, state.simulation)` is fast enough to run every render cycle (14 data points, O(n) operation).

### Anti-Pattern 3: Hardcoded Colors in CSS Modules

**What:** Writing `color: #0078d4` in a CSS Module when Fluent UI's `webDarkTheme` already defines `--colorBrandForeground1`.

**Why bad:** When the theme changes (e.g., switching to webLightTheme for a demo variant), CSS Module values do not update. Visual inconsistency breaks the demo narrative of enterprise-grade polish.

**Instead:** Use Fluent UI component props (`appearance="primary"`) and let the theme handle color. For structural CSS that genuinely has no Fluent equivalent (chart background, confidence band colors), use hardcoded values intentionally and document them.

### Anti-Pattern 4: Using useEffect for Reactive Chart Updates

**What:** Watching `state.simulation` in a useEffect, then imperatively calling `chart.update()`.

**Why bad:** Requires a ref to the Chart.js instance, introduces imperative code in a declarative component, creates ordering and cleanup hazards.

**Instead:** Pass `simulatedForecast` as a prop to `CashFlowChart`. When the prop changes, `react-chartjs-2` handles the chart update internally via its own reconciliation. The chart is a controlled component driven by props.

### Anti-Pattern 5: Test Files That Test the Mock Not the Component

**What:** A test for CashFlowChart that only asserts the mock's div is rendered.

**Why bad:** Tests the test mock, not the component logic.

**Instead:** Assert on conditional rendering (shortfall warning), data reaching the chart (labels in mock output), and responsive behavior (prop-driven class changes). The chart mock enables these assertions without being the subject of the test.

---

## Scalability Considerations

This is a prototype. These boundaries are designed for clarity and demo velocity, not infinite scale. However the patterns are correct for a production fintech SPA at this scale:

| Concern | At current scale (1 screen active) | If product grows |
|---------|-----------------------------------|--------------------|
| State management | useReducer + single context sufficient | Split into domain contexts (ForecastContext, InsightContext) or introduce Zustand |
| Mock data | Static TS modules — zero latency | Replace `initialState` sources with async fetch, add loading/error states |
| Routing | 3 routes, HashRouter | Add nested routes, lazy-loaded screens with React.lazy + Suspense |
| Chart performance | 14 data points, synchronous | Memoize `applySimulation` with useMemo if data grows to hundreds of points |
| Testing | Vitest unit + component tests | Add Playwright e2e for critical paths (approve insight, simulate scenario) |

---

## Sources

- Implementation plan: `docs/superpowers/plans/2026-04-02-smb-fnb-ai-copilot.md` — authoritative source for all code patterns (HIGH confidence)
- Project spec: `.planning/PROJECT.md` — architectural decisions and constraints (HIGH confidence)
- React 18 documentation (official): Context + useReducer patterns for app-level state are well-established; patterns here follow the canonical React docs recommendation for "medium complexity" apps that do not warrant external state libraries (HIGH confidence)
- Fluent UI v9 docs: CSS-in-JS (Griffel) + CSS Modules coexistence is supported; CSS Modules manage layout while Fluent handles tokens (MEDIUM confidence — based on training data; verify if FluentProvider token variable names change between minor versions)
- react-chartjs-2 testing pattern: `vi.mock('react-chartjs-2')` is the standard approach for jsdom environments; pattern matches what is specified in the implementation plan (HIGH confidence)
