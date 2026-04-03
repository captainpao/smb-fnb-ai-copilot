# Phase 1: Foundation - Research

**Researched:** 2026-04-03
**Domain:** Vite 8 + React 18 + TypeScript 5 + Fluent UI v9 + React Router v6 scaffold, global state, and app shell
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOOL-01 | Project scaffolded with Vite react-ts template, all dependencies installed at correct versions (react-router-dom@^6, typescript@^5) | Scaffold command verified; version pinning critical — see Standard Stack and Pitfalls |
| TOOL-02 | Vitest configured with jsdom, canvas mock, ResizeObserver polyfill, and jest-dom globals in setup.ts | Setup file pattern documented in Code Examples; jest-canvas-mock import order is critical |
| TOOL-03 | ESLint + Prettier configured; dev server starts cleanly | Vite 8 scaffolds ESLint by default; no additional config needed beyond tsconfig alignment |
| DATA-01 | TypeScript types defined for Transaction, ForecastData, Insight, Supplier, SimulationState, AppState | Type shapes specified in Architecture Patterns |
| DATA-02 | Static mock data files created: 15 transactions, 14-day forecast (shortfall Jan 21–22), 4 AI insights, 6 suppliers | Mock data structure specified in Architecture Patterns |
| DATA-03 | AppContext with useReducer provides global AppState seeded from mock data | Context + reducer pattern documented in Code Examples |
| DATA-04 | Reducer handles APPROVE_INSIGHT, DISMISS_INSIGHT, SET_SIMULATION without mutating state | Immutable reducer pattern documented in Code Examples |
| DATA-05 | Pure applySimulation(forecast, simulationState) returns new array with adjusted balances | Immutable function pattern documented in Code Examples; pitfall section covers mutation trap |
| NAV-01 | App wrapped in FluentProvider (webDarkTheme) at root, outside HashRouter | main.tsx pattern documented; wrapping order is a critical pitfall |
| NAV-02 | HashRouter with routes: `/` → Dashboard, `/simulate` → Simulate, `/payments` → Payments | Route pattern documented in Code Examples |
| NAV-03 | NavBar renders Fluent TabList with active route highlighting; bottom-fixed on mobile, top on desktop | TabList + useLocation + useNavigate pattern documented; CSS from UI-SPEC |
</phase_requirements>

---

## Summary

Phase 1 is a pure scaffold and plumbing phase: no business logic rendering, no charts, no data fetching. The output is a running app with correct tooling configuration, typed data layer, global state wiring, and a navigable shell in dark theme. Every subsequent phase builds on this foundation, so correctness here — particularly version pinning and the FluentProvider/HashRouter nesting order — prevents cascading failures later.

The entire technology stack is locked by CLAUDE.md with npm-verified versions as of 2026-04-03. There are no open decisions about library choices. Research focus is therefore on implementation patterns, configuration details, and known gotchas for this exact stack combination.

The most consequential risks in this phase are: (1) accidentally installing wrong major versions due to npm `latest` tags pointing to breaking releases for both `react-router-dom` and `typescript`; (2) `jest-canvas-mock` import order breaking chart tests if any chart import precedes it in `setup.ts`; (3) `FluentProvider` placed inside `HashRouter` causing portalled Fluent components to lose dark theme tokens.

**Primary recommendation:** Scaffold with `create-vite@9` react-ts template, then install all runtime and dev dependencies with explicit major-version pins as specified in CLAUDE.md. Configure Vitest before writing any application code so the test harness is proven clean from the start.

---

## Standard Stack

### Core (All versions live-verified 2026-04-03 via npm registry)

| Library | Pin Version | Purpose | Why Standard |
|---------|-------------|---------|--------------|
| `react` | `^18.3.1` | UI rendering | React 19 is now `latest` on npm — must pin ^18 explicitly |
| `react-dom` | `^18.3.1` | DOM renderer | Must match react version exactly |
| `@fluentui/react-components` | `^9.73.7` | Design system, all UI components | Locked per PRD; enterprise banking visual |
| `@fluentui/react-icons` | `^2.0.323` | Icon set for NavBar tabs | First-party Microsoft icons matching Fluent v9 |
| `react-router-dom` | `^6.30.3` | Client-side routing + HashRouter | `latest` npm tag points to v7 (breaking rewrite) — MUST pin ^6 |
| `chart.js` | `^4.5.1` | Chart rendering (used in Phase 2+) | Install now; types needed for ForecastData shape |
| `react-chartjs-2` | `^5.3.1` | React wrapper for Chart.js | Peer requires chart.js ^4.1.1 |

### Build / Dev Infrastructure

| Library | Pin Version | Purpose | Notes |
|---------|-------------|---------|-------|
| `vite` | `^8.0.3` | Build tool + dev server | Requires Node ^20.19.0 or >=22.12.0; uses Rolldown internally |
| `@vitejs/plugin-react` | `^6.0.1` | React HMR + JSX transform | Requires vite ^8.0.0; use Babel variant not -swc |
| `typescript` | `^5.9.3` | Type checking | TypeScript 6 is now `latest` on npm — MUST pin ^5 |
| `vitest` | `^4.1.2` | Test runner | Peer requires vite ^6/7/8 — confirmed |
| `jsdom` | `^29.0.1` | DOM environment for tests | Must be explicit dev dep; not bundled with vitest |
| `@testing-library/react` | `^16.3.2` | Component testing utilities | Peer requires react ^18 or ^19 |
| `@testing-library/jest-dom` | `^6.9.1` | Custom matchers for DOM assertions | Augments vitest expect |
| `@testing-library/dom` | `^10.4.1` | Direct DOM assertion utilities | Install explicitly |
| `jest-canvas-mock` | `^2.5.2` | Canvas stub for jsdom | MUST be first import in setup.ts before any chart import |
| `@types/react` | `^18.3.28` | React type definitions | Must stay ^18 — Fluent UI v9 peer requires @types/react <20.0.0 |
| `@types/react-dom` | `^18.3.7` | React DOM type definitions | Keep in ^18 range |

### Installation Command

```bash
# Scaffold
npm create vite@9 smb-fnb-ai-copilot -- --template react-ts
cd smb-fnb-ai-copilot

# Runtime deps — explicit major-version pins
npm install react@^18.3.1 react-dom@^18.3.1 \
  @fluentui/react-components@^9.73.7 \
  @fluentui/react-icons@^2.0.323 \
  react-router-dom@^6.30.3 \
  chart.js@^4.5.1 \
  react-chartjs-2@^5.3.1

# Dev deps — explicit major-version pins
npm install -D \
  vite@^8.0.3 \
  @vitejs/plugin-react@^6.0.1 \
  typescript@^5.9.3 \
  vitest@^4.1.2 \
  jsdom@^29.0.1 \
  @testing-library/react@^16.3.2 \
  @testing-library/jest-dom@^6.9.1 \
  @testing-library/dom@^10.4.1 \
  jest-canvas-mock@^2.5.2 \
  @types/react@^18.3.28 \
  @types/react-dom@^18.3.7
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── main.tsx              # FluentProvider(webDarkTheme) > HashRouter > App
├── App.tsx               # Route definitions, AppContext.Provider, App shell
├── App.module.css        # appShell, mainContent layout
├── index.css             # Global reset (box-sizing, body/html/root, scrollbar)
├── context/
│   ├── AppContext.tsx     # createContext, useReducer, AppContextProvider export
│   └── reducer.ts        # appReducer(state, action) — pure, no mutations
├── types/
│   └── index.ts          # All TypeScript interfaces exported from one file
├── data/
│   ├── transactions.ts   # 15 mock Transaction records
│   ├── forecast.ts       # 14-day ForecastData array (shortfall Jan 21–22)
│   ├── insights.ts       # 4 mock Insight records
│   └── suppliers.ts      # 6 mock Supplier records
├── utils/
│   └── simulation.ts     # applySimulation(forecast, simulationState): ForecastData[]
├── components/
│   └── NavBar/
│       ├── NavBar.tsx
│       └── NavBar.module.css
└── screens/
    ├── Dashboard/
    │   └── Dashboard.tsx  # Stub: Title2 + Body1 placeholder
    ├── Simulate/
    │   └── Simulate.tsx   # Stub
    └── Payments/
        └── Payments.tsx   # Stub
```

### Pattern 1: main.tsx — Provider Nesting Order

FluentProvider MUST wrap outside HashRouter. Portalled components (Tooltip, Dialog, Popover) look up the DOM tree for FluentProvider. If FluentProvider is inside HashRouter, portals that render outside the router tree lose dark theme tokens and render with flat grey.

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webDarkTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </FluentProvider>
  </React.StrictMode>
)
```

### Pattern 2: TypeScript Type Definitions

All types in a single `src/types/index.ts`. Keeps imports clean and prevents circular dependencies.

```typescript
// src/types/index.ts

export interface Transaction {
  id: string
  date: string          // ISO 8601 date string "YYYY-MM-DD"
  description: string
  amount: number        // Positive = credit, negative = debit
  category: string      // "revenue" | "cogs" | "rent" | "utilities" | "misc"
  type: 'credit' | 'debit'
}

export interface ForecastData {
  date: string          // ISO 8601 "YYYY-MM-DD"
  projectedBalance: number
  confidenceLower: number
  confidenceUpper: number
  isShortfall: boolean  // true when projectedBalance < 0
}

export type InsightConfidence = 'Low' | 'Medium' | 'High'
export type InsightStatus = 'pending' | 'approved' | 'dismissed'

export interface Insight {
  id: string
  title: string
  description: string
  impactAmount: number  // Positive = beneficial, negative = cost
  confidence: InsightConfidence
  status: InsightStatus
  reasoning: {
    signal: string
    causalChain: string
    projectedOutcome: string
  }
}

export type SupplierPriority = 'Flexible' | 'High Priority'

export interface Supplier {
  id: string
  name: string
  amount: number
  dueDate: string       // ISO 8601 "YYYY-MM-DD"
  priority: SupplierPriority
  aiRecommendation: string
}

export interface SimulationState {
  delayPaymentEnabled: boolean
  delayDays: number     // 0–30
  loanEnabled: boolean
  loanAmount: number
}

export interface AppState {
  transactions: Transaction[]
  forecast: ForecastData[]
  insights: Insight[]
  suppliers: Supplier[]
  simulation: SimulationState
  currentBalance: number
}
```

### Pattern 3: AppContext with useReducer

```tsx
// src/context/AppContext.tsx
import React, { createContext, useContext, useReducer } from 'react'
import type { AppState } from '../types'
import { appReducer, type AppAction } from './reducer'
import { transactions } from '../data/transactions'
import { forecast } from '../data/forecast'
import { insights } from '../data/insights'
import { suppliers } from '../data/suppliers'

const initialState: AppState = {
  transactions,
  forecast,
  insights,
  suppliers,
  simulation: {
    delayPaymentEnabled: false,
    delayDays: 0,
    loanEnabled: false,
    loanAmount: 0,
  },
  currentBalance: transactions.reduce((acc, t) => acc + t.amount, 0),
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider')
  return ctx
}
```

### Pattern 4: Reducer — Immutable State Updates

```typescript
// src/context/reducer.ts
import type { AppState, SimulationState } from '../types'

export type AppAction =
  | { type: 'APPROVE_INSIGHT'; payload: string }   // payload = insight id
  | { type: 'DISMISS_INSIGHT'; payload: string }   // payload = insight id
  | { type: 'SET_SIMULATION'; payload: Partial<SimulationState> }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'APPROVE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.payload ? { ...i, status: 'approved' } : i
        ),
      }
    case 'DISMISS_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.payload ? { ...i, status: 'dismissed' } : i
        ),
      }
    case 'SET_SIMULATION':
      return {
        ...state,
        simulation: { ...state.simulation, ...action.payload },
      }
    default:
      return state
  }
}
```

### Pattern 5: applySimulation — Pure Function

```typescript
// src/utils/simulation.ts
import type { ForecastData, SimulationState } from '../types'

export function applySimulation(
  forecast: ForecastData[],
  simulation: SimulationState
): ForecastData[] {
  if (!simulation.delayPaymentEnabled && !simulation.loanEnabled) {
    return forecast  // No-op: return same reference when no simulation active
  }

  return forecast.map((day, index): ForecastData => {
    let adjusted = day.projectedBalance

    if (simulation.loanEnabled && simulation.loanAmount > 0) {
      // Loan amount added as a one-time injection on day 0
      if (index === 0) adjusted += simulation.loanAmount
    }

    if (simulation.delayPaymentEnabled && simulation.delayDays > 0) {
      // Payment delay modeled as proportional balance improvement
      // (exact modeling refined in Phase 4 — placeholder proportional logic)
      adjusted += simulation.delayDays * 50
    }

    return {
      ...day,
      projectedBalance: adjusted,
      confidenceLower: day.confidenceLower + (adjusted - day.projectedBalance),
      confidenceUpper: day.confidenceUpper + (adjusted - day.projectedBalance),
      isShortfall: adjusted < 0,
    }
  })
}
```

Note: The proportional simulation math is intentionally placeholder for Phase 1. Phase 4 will implement the delta indicator and refine the simulation logic per SIM-04.

### Pattern 6: NavBar — TabList with useLocation + useNavigate

```tsx
// src/components/NavBar/NavBar.tsx
import { TabList, Tab } from '@fluentui/react-components'
import { HomeRegular, DataTrendingRegular, WalletRegular } from '@fluentui/react-icons'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './NavBar.module.css'

const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'dashboard',
  '/simulate': 'simulate',
  '/payments': 'payments',
}

const TAB_TO_ROUTE: Record<string, string> = {
  dashboard: '/',
  simulate: '/simulate',
  payments: '/payments',
}

export function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  // HashRouter location.pathname strips the hash prefix
  const activeTab = ROUTE_TO_TAB[location.pathname] ?? 'dashboard'

  return (
    <nav className={styles.navBar} aria-label="Main navigation">
      <TabList
        selectedValue={activeTab}
        onTabSelect={(_, data) => navigate(TAB_TO_ROUTE[data.value as string])}
      >
        <Tab value="dashboard" icon={<HomeRegular />}>Dashboard</Tab>
        <Tab value="simulate" icon={<DataTrendingRegular />}>Simulate</Tab>
        <Tab value="payments" icon={<WalletRegular />}>Payments</Tab>
      </TabList>
    </nav>
  )
}
```

Do NOT use `<Link>` inside `Tab`. Navigate imperatively via `onTabSelect`.

### Pattern 7: Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

```typescript
// src/test/setup.ts — ORDER IS CRITICAL
import 'jest-canvas-mock'                          // MUST be first — before any chart import
import '@testing-library/jest-dom'                 // Augments vitest expect with DOM matchers

// ResizeObserver polyfill for Fluent UI v9 in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver
```

```json
// tsconfig.json — required for vitest globals
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Anti-Patterns to Avoid

- **FluentProvider inside HashRouter:** Portal-rendered components (Tooltip, Dialog) lose dark theme tokens. Always: `FluentProvider > HashRouter > App`.
- **`<Link>` inside Fluent `<Tab>`:** Creates nested interactive elements with conflicting event handling and broken keyboard nav. Use `onTabSelect` + `useNavigate`.
- **`import 'jest-canvas-mock'` not first in setup.ts:** Any chart import before it causes `HTMLCanvasElement.getContext is not a function` crash in all tests.
- **Using `npm install react-router-dom` without @^6 pin:** Installs v7 (breaking rewrite). Always: `react-router-dom@^6.30.3`.
- **Using `npm install typescript` without @^5 pin:** Installs TypeScript 6 which breaks Fluent UI v9 internal types. Always: `typescript@^5.9.3`.
- **Mutating state in reducer or applySimulation:** React's `useReducer` detects reference equality. Mutations cause no re-render. Always spread: `{ ...state, ... }` and `forecast.map(day => ({ ...day, ... }))`.
- **Hardcoded hex colors in CSS Modules:** Always use `var(--colorNeutralBackground1)` etc. Hardcoded hex bypasses theme switching and dark mode tokens.
- **`import { SomeComponent } from '@fluentui/react-components/dist/...'`:** Always import from package root. Deep imports break tree-shaking and may resolve to wrong bundle.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark theme tokens | Custom CSS variables with hardcoded hex | `webDarkTheme` via `FluentProvider` | Theme coherence; contrast ratios pre-validated; tokens update consistently |
| Tab navigation with keyboard support | Custom tablist with `onClick` + active class | Fluent `TabList` + `Tab` | ARIA roles, keyboard (Arrow/Home/End), focus ring, selected state built in |
| Route-based active tab highlighting | Manual `className` comparison on `location.pathname` | `useLocation()` + `selectedValue` on `TabList` | Single source of truth; handles edge cases (trailing slash, case) |
| Immutable array updates in reducer | `array.splice()`, `array[i] = ...` mutations | `array.map(item => item.id === id ? { ...item, ... } : item)` | Mutations break React's change detection |
| Canvas test stub | `Object.defineProperty(HTMLCanvasElement...)` | `jest-canvas-mock` package | Handles all canvas API surface; prevents subtle test-only crashes |
| DOM resize observation in tests | `global.ResizeObserver = class { ... }` (from scratch) | Inline polyfill in setup.ts (3 lines) | Fluent UI calls ResizeObserver; jsdom lacks it; polyfill prevents crash |

**Key insight:** Every "don't hand-roll" item above has subtle edge cases that only appear at demo time. Fluent UI's TabList handles all ARIA requirements; jest-canvas-mock handles the full canvas API surface including `toDataURL`, `getImageData`, and `putImageData` that naive stubs miss.

---

## Common Pitfalls

### Pitfall 1: Wrong react-router-dom Major Version
**What goes wrong:** `npm install react-router-dom` installs v7 (the `latest` tag). v7 changes the API significantly: `Routes` and `Route` are replaced, `HashRouter` behavior is different, `useNavigate` has new constraints.
**Why it happens:** npm `latest` tag was updated to v7.14.0; v6 lives under the `version-6` dist-tag.
**How to avoid:** Always install with explicit pin: `npm install react-router-dom@^6.30.3`
**Warning signs:** TypeScript errors on `<Routes>`, `<Route element>` prop, or missing `HashRouter` in `react-router-dom` exports.

### Pitfall 2: FluentProvider Inside HashRouter
**What goes wrong:** Portalled Fluent components (Tooltip, Dialog, Popover, Combobox dropdown) render outside the `HashRouter` DOM subtree. They look up the tree for `FluentProvider` and fail to find it, rendering with no theme tokens — flat grey on white.
**Why it happens:** React portals render into `document.body` directly, bypassing the component tree.
**How to avoid:** `FluentProvider` must always be the outermost wrapper in `main.tsx`.
**Warning signs:** Tooltip/Dialog appears with no dark theme styling despite the rest of the app being correctly themed.

### Pitfall 3: jest-canvas-mock Import Order
**What goes wrong:** Any test that imports a Chart.js component (even indirectly) crashes with `TypeError: HTMLCanvasElement.prototype.getContext is not a function`.
**Why it happens:** jsdom has no canvas implementation. Chart.js calls `getContext('2d')` during import/registration. `jest-canvas-mock` patches `HTMLCanvasElement.prototype` — but only if it runs before Chart.js is loaded.
**How to avoid:** `import 'jest-canvas-mock'` must be the very first line in `setup.ts`.
**Warning signs:** Tests crash with canvas-related TypeError even though chart components are not being tested in that test file (transitive import paths trigger it).

### Pitfall 4: TypeScript 6 Breaking Fluent UI v9
**What goes wrong:** TypeScript 6 changed the behavior of several internal type resolution mechanisms that Fluent UI v9's internal generated types rely on. Type errors cascade through every Fluent component usage.
**Why it happens:** `npm install typescript` installs TypeScript 6 (the current `latest`).
**How to avoid:** Always pin `typescript@^5.9.3`.
**Warning signs:** Immediate TypeScript errors on `FluentProvider`, `webDarkTheme`, or any `@fluentui/react-components` import after a fresh install.

### Pitfall 5: Vitest Globals Without tsconfig Alignment
**What goes wrong:** TypeScript does not recognize `describe`, `it`, `expect`, `vi` as globals and reports them as undeclared identifiers — even though tests run fine at runtime.
**Why it happens:** `vitest.config.ts` sets `globals: true` but TypeScript still needs to know about the global types.
**How to avoid:** Add `"types": ["vitest/globals"]` to `compilerOptions` in `tsconfig.json` (or `tsconfig.app.json` if Vite 8 scaffold split the config).
**Warning signs:** Red underlines on `describe`/`it`/`expect` in IDE but tests pass on CLI.

### Pitfall 6: Vite 8 Scaffold Creates Split tsconfig Files
**What goes wrong:** `create-vite@9` scaffolds with `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`. The vitest globals type must go in `tsconfig.app.json` (the one covering `src/`), not `tsconfig.json`.
**Why it happens:** Vite 8's scaffold template splits tsconfig for better type isolation between app code and build scripts.
**How to avoid:** Check which tsconfig file covers `src/` and put `"types": ["vitest/globals"]` there.
**Warning signs:** Adding `vitest/globals` to `tsconfig.json` root has no effect; type errors persist in test files.

### Pitfall 7: ResizeObserver Not in jsdom
**What goes wrong:** Tests that render any Fluent UI component that uses `ResizeObserver` internally (including `TabList`, `FluentProvider`) crash with `ReferenceError: ResizeObserver is not defined`.
**Why it happens:** jsdom does not implement `ResizeObserver`. Fluent UI components use it for layout responsiveness.
**How to avoid:** Add the 3-line `ResizeObserver` polyfill to `setup.ts` after `jest-canvas-mock`.
**Warning signs:** Tests crash in jsdom environment with `ResizeObserver is not defined` on any Fluent UI component render.

---

## Code Examples

### App.tsx — Route Structure with AppContext

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext'
import { NavBar } from './components/NavBar/NavBar'
import { Dashboard } from './screens/Dashboard/Dashboard'
import { Simulate } from './screens/Simulate/Simulate'
import { Payments } from './screens/Payments/Payments'
import styles from './App.module.css'

export default function App() {
  return (
    <AppContextProvider>
      <div className={styles.appShell}>
        <NavBar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </AppContextProvider>
  )
}
```

### Dashboard Stub Screen

```tsx
// src/screens/Dashboard/Dashboard.tsx
import { Title2, Body1 } from '@fluentui/react-components'
import styles from './Dashboard.module.css'

export function Dashboard() {
  return (
    <div className={styles.stub}>
      <Title2>Dashboard</Title2>
      <Body1>Cash flow overview coming in Phase 2.</Body1>
    </div>
  )
}
```

```css
/* src/screens/Dashboard/Dashboard.module.css */
.stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacingVerticalM);
  min-height: 60vh;
  text-align: center;
}
```

### Mock Data Shape — Forecast with Shortfall

```typescript
// src/data/forecast.ts
import type { ForecastData } from '../types'

export const forecast: ForecastData[] = [
  { date: '2025-01-15', projectedBalance: 4200, confidenceLower: 3800, confidenceUpper: 4600, isShortfall: false },
  { date: '2025-01-16', projectedBalance: 3950, confidenceLower: 3500, confidenceUpper: 4400, isShortfall: false },
  { date: '2025-01-17', projectedBalance: 3600, confidenceLower: 3100, confidenceUpper: 4100, isShortfall: false },
  { date: '2025-01-18', projectedBalance: 2800, confidenceLower: 2300, confidenceUpper: 3300, isShortfall: false },
  { date: '2025-01-19', projectedBalance: 2100, confidenceLower: 1600, confidenceUpper: 2600, isShortfall: false },
  { date: '2025-01-20', projectedBalance: 800,  confidenceLower: 300,  confidenceUpper: 1300, isShortfall: false },
  { date: '2025-01-21', projectedBalance: -240, confidenceLower: -740, confidenceUpper: 260,  isShortfall: true  },
  { date: '2025-01-22', projectedBalance: -1200,confidenceLower: -1700,confidenceUpper: -700, isShortfall: true  },
  { date: '2025-01-23', projectedBalance: -600, confidenceLower: -1100,confidenceUpper: -100, isShortfall: true  },
  { date: '2025-01-24', projectedBalance: 400,  confidenceLower: -100, confidenceUpper: 900,  isShortfall: false },
  { date: '2025-01-25', projectedBalance: 1200, confidenceLower: 700,  confidenceUpper: 1700, isShortfall: false },
  { date: '2025-01-26', projectedBalance: 2100, confidenceLower: 1600, confidenceUpper: 2600, isShortfall: false },
  { date: '2025-01-27', projectedBalance: 2800, confidenceLower: 2300, confidenceUpper: 3300, isShortfall: false },
  { date: '2025-01-28', projectedBalance: 3400, confidenceLower: 2900, confidenceUpper: 3900, isShortfall: false },
]
```

### App.module.css — App Shell Layout

```css
/* src/App.module.css */
.appShell {
  min-height: 100vh;
  background-color: var(--colorNeutralBackground1);
  display: flex;
  flex-direction: column;
}

.mainContent {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacingVerticalL) var(--spacingHorizontalL);
  /* Mobile: reserve space for fixed bottom nav */
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

@media (min-width: 768px) {
  .mainContent {
    padding-bottom: var(--spacingVerticalL);
  }
}
```

### NavBar.module.css — Mobile Bottom / Desktop Top

```css
/* src/components/NavBar/NavBar.module.css */
.navBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--colorNeutralBackground2);
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid var(--colorNeutralStroke1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .navBar {
    position: sticky;
    top: 0;
    bottom: auto;
    border-top: none;
    border-bottom: 1px solid var(--colorNeutralStroke1);
    padding-bottom: 0;
    justify-content: space-between;
    padding: 0 var(--spacingHorizontalL);
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-router-dom` v5 `<Switch>` + `<Route>` | v6 `<Routes>` + `<Route element>` | React Router v6 (2021) | `element` prop replaces `component`/`render`; `<Routes>` replaces `<Switch>` |
| CRA (Create React App) | Vite | 2022–2023 | CRA is unmaintained; Vite is the standard |
| Fluent UI v8 (class components) | Fluent UI v9 (hooks, tokens) | 2022 | v9 has different import paths and `FluentProvider` API |
| Vitest + `test.config.js` separate file | `vitest.config.ts` inline or merged with `vite.config.ts` | Vitest 1.x+ | Can colocate or separate; separate preferred for clarity |
| `@testing-library/user-event` v13 | v14 (new async API) | 2022 | `userEvent.setup()` required in v14 — not needed in Phase 1 but relevant for Phase 4 |

**Deprecated/outdated:**
- `ReactDOM.render()`: Replaced by `ReactDOM.createRoot()` in React 18. Vite react-ts template uses `createRoot` by default.
- `React.FC` type annotation: Still works but widely considered unnecessary verbosity in modern TypeScript React code. Prefer explicit return type or no annotation.
- `HashRouter` `basename` prop with `#/` prefix: Not needed — HashRouter handles the hash automatically. Routes use clean paths (`/`, `/simulate`).

---

## Open Questions

1. **Simulation math precision in applySimulation (DATA-05)**
   - What we know: Phase 1 requires the function to exist and be pure/immutable; Phase 4 (SIM-04) adds the delta indicator
   - What's unclear: The exact balance adjustment formula for delay-payment simulation (per-day payment deferral math vs proportional approximation)
   - Recommendation: Implement as simple proportional placeholder in Phase 1 (adds `delayDays * dailyPaymentAmount`); refine in Phase 4 when delta indicator UX is built. Document the placeholder clearly with a TODO comment.

2. **Vite 8 config split: vitest globals in which tsconfig**
   - What we know: `create-vite@9` scaffolds with `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`
   - What's unclear: Whether the vitest template adds `vitest/globals` automatically or requires manual addition
   - Recommendation: After scaffold, inspect generated tsconfig files. Add `"types": ["vitest/globals"]` to the tsconfig that covers `src/` (typically `tsconfig.app.json`).

3. **PaymentRegular icon availability in @fluentui/react-icons v2**
   - What we know: UI-SPEC mentions `PaymentRegular` / `WalletRegular` as options; `@fluentui/react-icons` v2.0.323 is confirmed current
   - What's unclear: Whether `PaymentRegular` exists by that exact name in v2.0.323 (icon naming conventions changed between Fluent icon versions)
   - Recommendation: Use `WalletRegular` for Payments tab (confirmed to exist in Fluent icons); verify `PaymentRegular` exists before using it. If not found, `CreditCardRegular` or `MoneyRegular` are safe fallbacks.

---

## Sources

### Primary (HIGH confidence)
- npm registry direct queries (all versions live-verified 2026-04-03): `npm view vite version` → 8.0.3; `npm view react-router-dom dist-tags` → version-6: 6.30.3, latest: 7.14.0; `npm view typescript version` → 6.0.2; `npm view vitest version` → 4.1.2; `npm view @fluentui/react-components version` → 9.73.7; `npm view create-vite version` → 9.0.3
- CLAUDE.md — all stack decisions and compatibility issues (project source of truth, verified against npm registry on creation date 2026-04-03)
- .planning/phases/01-foundation/01-UI-SPEC.md — component inventory, CSS patterns, NavBar spec, spacing tokens, color tokens

### Secondary (MEDIUM confidence)
- .planning/REQUIREMENTS.md — phase requirements and data type shapes
- .planning/ROADMAP.md — phase goals, success criteria, dependency order
- .planning/STATE.md — accumulated decisions and known concerns

### Tertiary (LOW confidence)
- None — all claims in this document are supported by primary or secondary sources above.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions live-verified against npm registry 2026-04-03
- Architecture: HIGH — patterns derived from locked stack decisions in CLAUDE.md + UI-SPEC
- Pitfalls: HIGH — all pitfalls are documented in CLAUDE.md as verified compatibility issues, cross-referenced with live npm dist-tag verification
- Type shapes: MEDIUM — reasonable TypeScript interface design for the described mock data; final field names may be adjusted by planner without breaking requirements

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable stack; no fast-moving dependencies)
