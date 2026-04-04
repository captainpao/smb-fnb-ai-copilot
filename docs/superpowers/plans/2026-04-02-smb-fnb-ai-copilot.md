# SMB F&B AI Co-Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + TypeScript prototype of an AI-powered F&B banking co-pilot with cash flow forecasting, AI insights, scenario simulation, and supplier payment management — all driven by static mock data.

**Architecture:** A Vite-scaffolded SPA using Fluent UI v9 for design, React Router v6 (HashRouter) for navigation, and a single `useReducer`-based AppContext for global state seeded from static mock files. The Simulator derives its chart data via a pure function over `SimulationState` — no async, no backend.

**Tech Stack:** Vite, React 18, TypeScript 5, `@fluentui/react-components@9`, `@fluentui/react-icons`, `react-router-dom`, `react-chartjs-2`, `chart.js`, CSS Modules, Vitest, `@testing-library/react`

---

## File Map

```
smb-fnb-ai-copilot/
├── src/
│   ├── main.tsx                        # App entry, FluentProvider + HashRouter
│   ├── App.tsx                         # Route definitions
│   ├── types.ts                        # All shared TypeScript types
│   ├── mock/
│   │   ├── transactions.ts             # 30-day transaction history
│   │   ├── forecast.ts                 # 14-day base forecast
│   │   ├── insights.ts                 # 4 pre-authored AI insights
│   │   └── suppliers.ts                # 6 supplier records
│   ├── context/
│   │   ├── AppContext.tsx              # createContext + AppProvider
│   │   └── reducer.ts                  # useReducer actions + reducer fn
│   ├── hooks/
│   │   └── useSimulatedForecast.ts     # Pure fn: applies SimulationState to forecast
│   ├── components/
│   │   ├── NavBar/
│   │   │   ├── NavBar.tsx
│   │   │   └── NavBar.module.css
│   │   ├── CashFlowChart/
│   │   │   ├── CashFlowChart.tsx
│   │   │   └── CashFlowChart.module.css
│   │   ├── InsightCard/
│   │   │   ├── InsightCard.tsx
│   │   │   └── InsightCard.module.css
│   │   ├── SupplierList/
│   │   │   ├── SupplierList.tsx
│   │   │   └── SupplierList.module.css
│   │   ├── SimulatorPanel/
│   │   │   ├── SimulatorPanel.tsx
│   │   │   └── SimulatorPanel.module.css
│   │   └── FinanceCard/
│   │       ├── FinanceCard.tsx
│   │       └── FinanceCard.module.css
│   ├── screens/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.module.css
│   │   ├── Simulate/
│   │   │   ├── Simulate.tsx
│   │   │   └── Simulate.module.css
│   │   └── Payments/
│   │       ├── Payments.tsx
│   │       └── Payments.module.css
│   └── utils/
│       └── simulateForecast.ts         # Pure function: applySimulation(forecast, sim)
├── src/test/
│   ├── setup.ts
│   ├── reducer.test.ts
│   ├── simulateForecast.test.ts
│   ├── CashFlowChart.test.tsx
│   ├── InsightCard.test.tsx
│   └── SupplierList.test.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Scaffold Project + Install Dependencies

**Files:**
- Create: project root via CLI

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /path/to/your/workspace
npm create vite@latest smb-fnb-ai-copilot -- --template react-ts
cd smb-fnb-ai-copilot
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install @fluentui/react-components@9 @fluentui/react-icons
npm install react-router-dom
npm install chart.js react-chartjs-2
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 4: Create test setup file**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

Open `package.json` and add to the `scripts` block:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at `http://localhost:5173`. Browser shows default React template page.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite React-TS project with Fluent UI, Router, Chart.js, Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write the types file**

```ts
// src/types.ts

export type Transaction = {
  id: string
  date: string          // ISO 8601 e.g. "2024-01-15"
  amount: number        // positive; direction via type
  type: 'credit' | 'debit'
  category: 'sales' | 'supplier' | 'rent' | 'payroll'
}

export type ForecastData = {
  date: string          // ISO 8601
  projectedBalance: number
  lowerBound: number
  upperBound: number
}

export type Insight = {
  id: string
  title: string
  description: string
  reasoning: string     // shown in "Why this?" section
  impact: number        // cash impact in SGD (positive = saves money)
  confidence: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'dismissed'
}

export type Supplier = {
  id: string
  name: string
  amount: number
  dueDate: string       // ISO 8601
  priority: 'flexible' | 'high-priority'
  aiRecommendation: string
}

export type SimulationState = {
  delayPaymentEnabled: boolean
  delayDays: number           // 0–30
  loanEnabled: boolean
  loanAmount: number
}

export type AppState = {
  balance: number
  forecast: ForecastData[]
  insights: Insight[]
  suppliers: Supplier[]
  simulation: SimulationState
  transactions: Transaction[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Mock Data

**Files:**
- Create: `src/mock/transactions.ts`
- Create: `src/mock/forecast.ts`
- Create: `src/mock/insights.ts`
- Create: `src/mock/suppliers.ts`

- [ ] **Step 1: Create mock transactions**

```ts
// src/mock/transactions.ts
import { Transaction } from '../types'

export const mockTransactions: Transaction[] = [
  { id: 't1',  date: '2024-01-01', amount: 3200, type: 'credit', category: 'sales' },
  { id: 't2',  date: '2024-01-01', amount: 800,  type: 'debit',  category: 'supplier' },
  { id: 't3',  date: '2024-01-02', amount: 2900, type: 'credit', category: 'sales' },
  { id: 't4',  date: '2024-01-03', amount: 3100, type: 'credit', category: 'sales' },
  { id: 't5',  date: '2024-01-04', amount: 4500, type: 'debit',  category: 'rent' },
  { id: 't6',  date: '2024-01-05', amount: 2700, type: 'credit', category: 'sales' },
  { id: 't7',  date: '2024-01-06', amount: 600,  type: 'debit',  category: 'supplier' },
  { id: 't8',  date: '2024-01-07', amount: 3400, type: 'credit', category: 'sales' },
  { id: 't9',  date: '2024-01-08', amount: 3000, type: 'credit', category: 'sales' },
  { id: 't10', date: '2024-01-09', amount: 1200, type: 'debit',  category: 'payroll' },
  { id: 't11', date: '2024-01-10', amount: 2800, type: 'credit', category: 'sales' },
  { id: 't12', date: '2024-01-11', amount: 700,  type: 'debit',  category: 'supplier' },
  { id: 't13', date: '2024-01-12', amount: 3300, type: 'credit', category: 'sales' },
  { id: 't14', date: '2024-01-13', amount: 2600, type: 'credit', category: 'sales' },
  { id: 't15', date: '2024-01-14', amount: 900,  type: 'debit',  category: 'supplier' },
]
```

- [ ] **Step 2: Create mock forecast (14-day projection showing a shortfall)**

```ts
// src/mock/forecast.ts
import { ForecastData } from '../types'

export const mockForecast: ForecastData[] = [
  { date: '2024-01-15', projectedBalance: 8200,  lowerBound: 7800,  upperBound: 8600 },
  { date: '2024-01-16', projectedBalance: 9100,  lowerBound: 8600,  upperBound: 9600 },
  { date: '2024-01-17', projectedBalance: 7400,  lowerBound: 6900,  upperBound: 7900 },
  { date: '2024-01-18', projectedBalance: 5800,  lowerBound: 5200,  upperBound: 6400 },
  { date: '2024-01-19', projectedBalance: 4200,  lowerBound: 3500,  upperBound: 4900 },
  { date: '2024-01-20', projectedBalance: 2100,  lowerBound: 1400,  upperBound: 2800 },  // warning zone
  { date: '2024-01-21', projectedBalance: -400,  lowerBound: -1200, upperBound: 400 },   // shortfall
  { date: '2024-01-22', projectedBalance: -1800, lowerBound: -2700, upperBound: -900 },
  { date: '2024-01-23', projectedBalance: 900,   lowerBound: 100,   upperBound: 1700 },  // payroll in
  { date: '2024-01-24', projectedBalance: 2400,  lowerBound: 1600,  upperBound: 3200 },
  { date: '2024-01-25', projectedBalance: 3800,  lowerBound: 3000,  upperBound: 4600 },
  { date: '2024-01-26', projectedBalance: 5100,  lowerBound: 4200,  upperBound: 6000 },
  { date: '2024-01-27', projectedBalance: 6300,  lowerBound: 5400,  upperBound: 7200 },
  { date: '2024-01-28', projectedBalance: 7200,  lowerBound: 6300,  upperBound: 8100 },
]
```

- [ ] **Step 3: Create mock insights**

```ts
// src/mock/insights.ts
import { Insight } from '../types'

export const mockInsights: Insight[] = [
  {
    id: 'i1',
    title: 'Delay Sheng Siong payment by 5 days',
    description: 'Moving your $1,200 supplier payment to Jan 26 avoids the projected shortfall.',
    reasoning: 'Based on your last 3 months of transactions, Sheng Siong has accepted late payments twice before with no penalty. Your cash gap opens Jan 21–22.',
    impact: 1200,
    confidence: 'high',
    status: 'pending',
  },
  {
    id: 'i2',
    title: 'Apply for $3,000 short-term credit line',
    description: 'A revolving credit line bridges the 2-day shortfall with minimal interest cost (~$18).',
    reasoning: 'Your average daily sales of $3,000 and consistent payroll history make you eligible for express business credit. Projected interest over 2 days: $18.',
    impact: 3000,
    confidence: 'medium',
    status: 'pending',
  },
  {
    id: 'i3',
    title: 'Reduce weekend ingredient order by 20%',
    description: 'Last 3 Sundays showed 18% lower footfall. Reducing order saves ~$240 this week.',
    reasoning: 'Comparing your Sunday POS receipts against ingredient purchases shows a consistent over-order pattern on weekends.',
    impact: 240,
    confidence: 'medium',
    status: 'pending',
  },
  {
    id: 'i4',
    title: 'Collect outstanding $650 from catering client',
    description: 'Invoice #INV-2024-009 is 12 days overdue. Collecting now directly improves your Jan 21 balance.',
    reasoning: 'This client has paid within 3 days of follow-up in past months.',
    impact: 650,
    confidence: 'high',
    status: 'pending',
  },
]
```

- [ ] **Step 4: Create mock suppliers**

```ts
// src/mock/suppliers.ts
import { Supplier } from '../types'

export const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'Sheng Siong (Produce)',
    amount: 1200,
    dueDate: '2024-01-21',
    priority: 'flexible',
    aiRecommendation: 'Delay 5 days — no penalty history',
  },
  {
    id: 's2',
    name: 'Cold Storage (Dairy)',
    amount: 480,
    dueDate: '2024-01-22',
    priority: 'flexible',
    aiRecommendation: 'Delay 3 days — within terms',
  },
  {
    id: 's3',
    name: 'SP Services (Utilities)',
    amount: 620,
    dueDate: '2024-01-20',
    priority: 'high-priority',
    aiRecommendation: 'Pay on time — late fee applies',
  },
  {
    id: 's4',
    name: 'Coffee Beans Direct',
    amount: 340,
    dueDate: '2024-01-23',
    priority: 'flexible',
    aiRecommendation: 'Delay 4 days — supplier confirmed OK',
  },
  {
    id: 's5',
    name: 'SingTel Business',
    amount: 180,
    dueDate: '2024-01-25',
    priority: 'high-priority',
    aiRecommendation: 'Pay on time — service interruption risk',
  },
  {
    id: 's6',
    name: 'Packaging Supplies Co.',
    amount: 290,
    dueDate: '2024-01-26',
    priority: 'flexible',
    aiRecommendation: 'Delay 7 days — ample lead time',
  },
]
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/mock/ src/types.ts
git commit -m "feat: add mock data for transactions, forecast, insights, suppliers"
```

---

## Task 4: Simulate Forecast Utility + Tests

**Files:**
- Create: `src/utils/simulateForecast.ts`
- Create: `src/test/simulateForecast.test.ts`

- [ ] **Step 1: Write the failing tests first**

```ts
// src/test/simulateForecast.test.ts
import { describe, it, expect } from 'vitest'
import { applySimulation } from '../utils/simulateForecast'
import { mockForecast } from '../mock/forecast'
import { SimulationState } from '../types'

const baseSimulation: SimulationState = {
  delayPaymentEnabled: false,
  delayDays: 0,
  loanEnabled: false,
  loanAmount: 0,
}

describe('applySimulation', () => {
  it('returns forecast unchanged when no simulation is active', () => {
    const result = applySimulation(mockForecast, baseSimulation)
    expect(result).toEqual(mockForecast)
  })

  it('adds loan amount to all projected balances when loan is enabled', () => {
    const sim: SimulationState = { ...baseSimulation, loanEnabled: true, loanAmount: 3000 }
    const result = applySimulation(mockForecast, sim)
    result.forEach((day, i) => {
      expect(day.projectedBalance).toBe(mockForecast[i].projectedBalance + 3000)
    })
  })

  it('adds delay payment amount to balances on and after the delay date when enabled', () => {
    // delayDays=5 means supplier payment of $1200 is deferred 5 days
    // balance should be +1200 for days 0..4, then drop back
    const sim: SimulationState = {
      ...baseSimulation,
      delayPaymentEnabled: true,
      delayDays: 5,
    }
    const result = applySimulation(mockForecast, sim)
    // First 5 days: delayed payment keeps balance higher
    for (let i = 0; i < 5; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 1200)
    }
    // After delay days: payment has been made, no boost
    for (let i = 5; i < result.length; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance)
    }
  })

  it('combines loan and delay payment effects', () => {
    const sim: SimulationState = {
      delayPaymentEnabled: true,
      delayDays: 3,
      loanEnabled: true,
      loanAmount: 2000,
    }
    const result = applySimulation(mockForecast, sim)
    // First 3 days: both effects active
    for (let i = 0; i < 3; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 1200 + 2000)
    }
    // After 3 days: only loan remains
    for (let i = 3; i < result.length; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 2000)
    }
  })

  it('does not mutate the original forecast array', () => {
    const original = mockForecast.map(d => ({ ...d }))
    const sim: SimulationState = { ...baseSimulation, loanEnabled: true, loanAmount: 5000 }
    applySimulation(mockForecast, sim)
    expect(mockForecast).toEqual(original)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../utils/simulateForecast'`

- [ ] **Step 3: Implement the utility**

```ts
// src/utils/simulateForecast.ts
import { ForecastData, SimulationState } from '../types'

// Delayed payment amount in SGD — matches the Sheng Siong insight
const DELAYED_PAYMENT_AMOUNT = 1200

export function applySimulation(
  forecast: ForecastData[],
  simulation: SimulationState
): ForecastData[] {
  return forecast.map((day, index) => {
    let delta = 0

    if (simulation.loanEnabled) {
      delta += simulation.loanAmount
    }

    if (simulation.delayPaymentEnabled && index < simulation.delayDays) {
      delta += DELAYED_PAYMENT_AMOUNT
    }

    if (delta === 0) return day

    return {
      ...day,
      projectedBalance: day.projectedBalance + delta,
      lowerBound: day.lowerBound + delta,
      upperBound: day.upperBound + delta,
    }
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/simulateForecast.ts src/test/simulateForecast.test.ts
git commit -m "feat: add applySimulation pure function with tests"
```

---

## Task 5: AppContext + Reducer

**Files:**
- Create: `src/context/reducer.ts`
- Create: `src/context/AppContext.tsx`
- Create: `src/test/reducer.test.ts`

- [ ] **Step 1: Write failing reducer tests**

```ts
// src/test/reducer.test.ts
import { describe, it, expect } from 'vitest'
import { appReducer, initialState } from '../context/reducer'

describe('appReducer', () => {
  it('APPROVE_INSIGHT sets insight status to approved', () => {
    const state = appReducer(initialState, { type: 'APPROVE_INSIGHT', id: 'i1' })
    const insight = state.insights.find(i => i.id === 'i1')
    expect(insight?.status).toBe('approved')
  })

  it('DISMISS_INSIGHT sets insight status to dismissed', () => {
    const state = appReducer(initialState, { type: 'DISMISS_INSIGHT', id: 'i2' })
    const insight = state.insights.find(i => i.id === 'i2')
    expect(insight?.status).toBe('dismissed')
  })

  it('SET_SIMULATION updates simulation state', () => {
    const newSim = {
      delayPaymentEnabled: true,
      delayDays: 7,
      loanEnabled: false,
      loanAmount: 0,
    }
    const state = appReducer(initialState, { type: 'SET_SIMULATION', simulation: newSim })
    expect(state.simulation).toEqual(newSim)
  })

  it('does not mutate original state', () => {
    const before = JSON.stringify(initialState)
    appReducer(initialState, { type: 'APPROVE_INSIGHT', id: 'i1' })
    expect(JSON.stringify(initialState)).toBe(before)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../context/reducer'`

- [ ] **Step 3: Implement the reducer**

```ts
// src/context/reducer.ts
import { AppState, SimulationState } from '../types'
import { mockTransactions } from '../mock/transactions'
import { mockForecast } from '../mock/forecast'
import { mockInsights } from '../mock/insights'
import { mockSuppliers } from '../mock/suppliers'

export type AppAction =
  | { type: 'APPROVE_INSIGHT'; id: string }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'SET_SIMULATION'; simulation: SimulationState }

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

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'APPROVE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.id ? { ...i, status: 'approved' } : i
        ),
      }
    case 'DISMISS_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.id ? { ...i, status: 'dismissed' } : i
        ),
      }
    case 'SET_SIMULATION':
      return { ...state, simulation: action.simulation }
    default:
      return state
  }
}
```

- [ ] **Step 4: Implement AppContext**

```tsx
// src/context/AppContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'
import { AppState, SimulationState } from '../types'
import { appReducer, initialState, AppAction } from './reducer'

type AppContextValue = {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS (5 from simulateForecast + 4 from reducer = 9 total).

- [ ] **Step 6: Commit**

```bash
git add src/context/ src/test/reducer.test.ts
git commit -m "feat: add AppContext with useReducer and action handlers"
```

---

## Task 6: App Shell (main.tsx, App.tsx, NavBar)

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/NavBar/NavBar.tsx`
- Create: `src/components/NavBar/NavBar.module.css`

- [ ] **Step 1: Update `main.tsx`**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <FluentProvider theme={webDarkTheme}>
        <AppProvider>
          <App />
        </AppProvider>
      </FluentProvider>
    </HashRouter>
  </React.StrictMode>
)
```

- [ ] **Step 2: Update `App.tsx`**

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import Dashboard from './screens/Dashboard/Dashboard'
import Simulate from './screens/Simulate/Simulate'
import Payments from './screens/Payments/Payments'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.appShell}>
      <NavBar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create `App.module.css`**

```css
/* src/App.module.css */
.appShell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #141414;
}

.main {
  flex: 1;
  padding: 24px 16px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main {
    padding: 16px 12px 80px;
  }
}
```

- [ ] **Step 4: Create `NavBar.tsx`**

```tsx
// src/components/NavBar/NavBar.tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { TabList, Tab } from '@fluentui/react-components'
import {
  DataPieRegular,
  ArrowTrendingLinesRegular,
  PaymentRegular,
} from '@fluentui/react-icons'
import styles from './NavBar.module.css'

const tabs = [
  { value: '/',          label: 'Dashboard', icon: <DataPieRegular /> },
  { value: '/simulate',  label: 'Simulate',  icon: <ArrowTrendingLinesRegular /> },
  { value: '/payments',  label: 'Payments',  icon: <PaymentRegular /> },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>SMB Cashflow Copilot</div>
      <TabList
        selectedValue={pathname}
        onTabSelect={(_, data) => navigate(data.value as string)}
        className={styles.tabList}
      >
        {tabs.map(tab => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </nav>
  )
}
```

- [ ] **Step 5: Create `NavBar.module.css`**

```css
/* src/components/NavBar/NavBar.module.css */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #1a1a1a;
}

.brand {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.tabList {
  flex: 1;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
    padding: 4px 8px;
    z-index: 100;
  }

  .brand {
    display: none;
  }

  .tabList {
    justify-content: space-around;
    width: 100%;
  }
}
```

- [ ] **Step 6: Create stub screens so App compiles**

```tsx
// src/screens/Dashboard/Dashboard.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

```tsx
// src/screens/Simulate/Simulate.tsx
export default function Simulate() {
  return <div>Simulate</div>
}
```

```tsx
// src/screens/Payments/Payments.tsx
export default function Payments() {
  return <div>Payments</div>
}
```

- [ ] **Step 7: Verify app runs with nav working**

```bash
npm run dev
```

Expected: App loads with dark background. NavBar visible at top. Clicking tabs updates the URL hash and shows stub screen text.

- [ ] **Step 8: Commit**

```bash
git add src/main.tsx src/App.tsx src/App.module.css src/components/NavBar/ src/screens/
git commit -m "feat: add app shell with HashRouter, FluentProvider, and NavBar"
```

---

## Task 7: CashFlowChart Component + Tests

**Files:**
- Create: `src/components/CashFlowChart/CashFlowChart.tsx`
- Create: `src/components/CashFlowChart/CashFlowChart.module.css`
- Create: `src/test/CashFlowChart.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/test/CashFlowChart.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CashFlowChart from '../components/CashFlowChart/CashFlowChart'
import { mockForecast } from '../mock/forecast'

// Chart.js requires canvas; mock it in jsdom
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="line-chart">{data.labels.join(',')}</div>
  ),
}))

describe('CashFlowChart', () => {
  it('renders a chart with forecast date labels', () => {
    render(<CashFlowChart forecast={mockForecast} />)
    const chart = screen.getByTestId('line-chart')
    expect(chart).toBeInTheDocument()
    expect(chart.textContent).toContain('2024-01-15')
  })

  it('renders shortfall warning when any projected balance is below zero', () => {
    render(<CashFlowChart forecast={mockForecast} />)
    expect(screen.getByText(/shortfall/i)).toBeInTheDocument()
  })

  it('does not render warning when all balances are positive', () => {
    const positiveForeccast = mockForecast.map(d => ({ ...d, projectedBalance: Math.abs(d.projectedBalance) + 100 }))
    render(<CashFlowChart forecast={positiveForeccast} />)
    expect(screen.queryByText(/shortfall/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../components/CashFlowChart/CashFlowChart'`

- [ ] **Step 3: Implement CashFlowChart**

```tsx
// src/components/CashFlowChart/CashFlowChart.tsx
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { MessageBar, MessageBarBody } from '@fluentui/react-components'
import { ForecastData } from '../../types'
import styles from './CashFlowChart.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

type Props = {
  forecast: ForecastData[]
}

export default function CashFlowChart({ forecast }: Props) {
  const hasShortfall = forecast.some(d => d.projectedBalance < 0)

  const data = {
    labels: forecast.map(d => d.date),
    datasets: [
      {
        label: 'Projected Balance',
        data: forecast.map(d => d.projectedBalance),
        borderColor: '#0078d4',
        backgroundColor: 'rgba(0, 120, 212, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Lower Bound',
        data: forecast.map(d => d.lowerBound),
        borderColor: 'rgba(255,255,255,0.15)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Upper Bound',
        data: forecast.map(d => d.upperBound),
        borderColor: 'rgba(255,255,255,0.15)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            `SGD ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#999', maxTicksLimit: 7 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: {
          color: '#999',
          callback: (v: number | string) => `$${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  }

  return (
    <div className={styles.container}>
      {hasShortfall && (
        <MessageBar intent="warning">
          <MessageBarBody>
            Cash shortfall projected — review AI suggestions below
          </MessageBarBody>
        </MessageBar>
      )}
      <div className={styles.chartWrapper}>
        <Line data={data} options={options as object} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `CashFlowChart.module.css`**

```css
/* src/components/CashFlowChart/CashFlowChart.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chartWrapper {
  height: 260px;
  position: relative;
}

@media (max-width: 768px) {
  .chartWrapper {
    height: 200px;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS (9 existing + 3 new = 12 total).

- [ ] **Step 6: Commit**

```bash
git add src/components/CashFlowChart/ src/test/CashFlowChart.test.tsx
git commit -m "feat: add CashFlowChart with shortfall warning"
```

---

## Task 8: InsightCard Component + Tests

**Files:**
- Create: `src/components/InsightCard/InsightCard.tsx`
- Create: `src/components/InsightCard/InsightCard.module.css`
- Create: `src/test/InsightCard.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/test/InsightCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InsightCard from '../components/InsightCard/InsightCard'
import { mockInsights } from '../mock/insights'

const insight = mockInsights[0]

describe('InsightCard', () => {
  it('renders insight title and description', () => {
    render(<InsightCard insight={insight} onApprove={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText(insight.title)).toBeInTheDocument()
    expect(screen.getByText(insight.description)).toBeInTheDocument()
  })

  it('calls onApprove with insight id when Approve is clicked', () => {
    const onApprove = vi.fn()
    render(<InsightCard insight={insight} onApprove={onApprove} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /approve/i }))
    expect(onApprove).toHaveBeenCalledWith(insight.id)
  })

  it('calls onDismiss with insight id when Dismiss is clicked', () => {
    const onDismiss = vi.fn()
    render(<InsightCard insight={insight} onApprove={vi.fn()} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledWith(insight.id)
  })

  it('shows approved badge when status is approved', () => {
    render(
      <InsightCard
        insight={{ ...insight, status: 'approved' }}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
      />
    )
    expect(screen.getByText(/approved/i)).toBeInTheDocument()
  })

  it('hides approve/dismiss buttons when status is not pending', () => {
    render(
      <InsightCard
        insight={{ ...insight, status: 'dismissed' }}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../components/InsightCard/InsightCard'`

- [ ] **Step 3: Implement InsightCard**

```tsx
// src/components/InsightCard/InsightCard.tsx
import {
  Card,
  CardHeader,
  CardFooter,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Text,
} from '@fluentui/react-components'
import { CheckmarkCircleRegular } from '@fluentui/react-icons'
import { Insight } from '../../types'
import styles from './InsightCard.module.css'

const confidenceColor = {
  low: 'warning',
  medium: 'important',
  high: 'success',
} as const

type Props = {
  insight: Insight
  onApprove: (id: string) => void
  onDismiss: (id: string) => void
}

export default function InsightCard({ insight, onApprove, onDismiss }: Props) {
  const isPending = insight.status === 'pending'

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <div className={styles.headerRow}>
            <Text weight="semibold">{insight.title}</Text>
            <Badge appearance="filled" color={confidenceColor[insight.confidence]}>
              {insight.confidence.charAt(0).toUpperCase() + insight.confidence.slice(1)} confidence
            </Badge>
          </div>
        }
      />
      <div className={styles.body}>
        <Text>{insight.description}</Text>
        <Text className={styles.impact}>
          +SGD {insight.impact.toLocaleString()} cash impact
        </Text>
        <Accordion collapsible>
          <AccordionItem value="why">
            <AccordionHeader>Why this?</AccordionHeader>
            <AccordionPanel>
              <Text size={200}>{insight.reasoning}</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
      <CardFooter>
        {isPending ? (
          <div className={styles.actions}>
            <Button appearance="primary" onClick={() => onApprove(insight.id)}>
              Approve
            </Button>
            <Button appearance="subtle" onClick={() => onDismiss(insight.id)}>
              Dismiss
            </Button>
          </div>
        ) : (
          <Badge
            appearance="filled"
            color={insight.status === 'approved' ? 'success' : 'subtle'}
            icon={insight.status === 'approved' ? <CheckmarkCircleRegular /> : undefined}
          >
            {insight.status === 'approved' ? 'Approved' : 'Dismissed'}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
```

- [ ] **Step 4: Create `InsightCard.module.css`**

```css
/* src/components/InsightCard/InsightCard.module.css */
.card {
  width: 100%;
}

.headerRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 4px;
}

.impact {
  color: #6cbe6c;
  font-size: 13px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS (12 existing + 5 new = 17 total).

- [ ] **Step 6: Commit**

```bash
git add src/components/InsightCard/ src/test/InsightCard.test.tsx
git commit -m "feat: add InsightCard with approve/dismiss/why-this interactions"
```

---

## Task 9: SupplierList Component + Tests

**Files:**
- Create: `src/components/SupplierList/SupplierList.tsx`
- Create: `src/components/SupplierList/SupplierList.module.css`
- Create: `src/test/SupplierList.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/test/SupplierList.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SupplierList from '../components/SupplierList/SupplierList'
import { mockSuppliers } from '../mock/suppliers'

describe('SupplierList', () => {
  it('renders all supplier names', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    mockSuppliers.forEach(s => {
      expect(screen.getByText(s.name)).toBeInTheDocument()
    })
  })

  it('shows Flexible badge for flexible suppliers', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    const flexible = mockSuppliers.filter(s => s.priority === 'flexible')
    expect(screen.getAllByText('Flexible').length).toBe(flexible.length)
  })

  it('shows High Priority badge for high-priority suppliers', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    const highPriority = mockSuppliers.filter(s => s.priority === 'high-priority')
    expect(screen.getAllByText('High Priority').length).toBe(highPriority.length)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../components/SupplierList/SupplierList'`

- [ ] **Step 3: Implement SupplierList**

```tsx
// src/components/SupplierList/SupplierList.tsx
import { Badge, Text, Tooltip, Button } from '@fluentui/react-components'
import { Supplier } from '../../types'
import styles from './SupplierList.module.css'

type Props = {
  suppliers: Supplier[]
}

export default function SupplierList({ suppliers }: Props) {
  return (
    <div className={styles.table}>
      <div className={styles.headerRow}>
        <Text weight="semibold" size={200}>Supplier</Text>
        <Text weight="semibold" size={200}>Amount</Text>
        <Text weight="semibold" size={200}>Due</Text>
        <Text weight="semibold" size={200}>Priority</Text>
        <Text weight="semibold" size={200}>Action</Text>
      </div>
      {suppliers.map(supplier => (
        <div key={supplier.id} className={styles.row}>
          <Text>{supplier.name}</Text>
          <Text>SGD {supplier.amount.toLocaleString()}</Text>
          <Text>{supplier.dueDate}</Text>
          <Badge
            appearance="filled"
            color={supplier.priority === 'flexible' ? 'success' : 'danger'}
          >
            {supplier.priority === 'flexible' ? 'Flexible' : 'High Priority'}
          </Badge>
          <Tooltip content={supplier.aiRecommendation} relationship="description">
            <Button size="small" appearance="outline">
              View Suggestion
            </Button>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `SupplierList.module.css`**

```css
/* src/components/SupplierList/SupplierList.module.css */
.table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.headerRow,
.row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
}

.headerRow {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.row:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .headerRow {
    display: none;
  }

  .row {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS (17 existing + 3 new = 20 total).

- [ ] **Step 6: Commit**

```bash
git add src/components/SupplierList/ src/test/SupplierList.test.tsx
git commit -m "feat: add SupplierList with priority badges and tooltips"
```

---

## Task 10: SimulatorPanel Component

**Files:**
- Create: `src/components/SimulatorPanel/SimulatorPanel.tsx`
- Create: `src/components/SimulatorPanel/SimulatorPanel.module.css`

- [ ] **Step 1: Implement SimulatorPanel**

```tsx
// src/components/SimulatorPanel/SimulatorPanel.tsx
import { Switch, Slider, Label, Text, Badge, Card, CardHeader } from '@fluentui/react-components'
import { SimulationState } from '../../types'
import styles from './SimulatorPanel.module.css'

type Props = {
  simulation: SimulationState
  onChange: (sim: SimulationState) => void
}

export default function SimulatorPanel({ simulation, onChange }: Props) {
  const update = (partial: Partial<SimulationState>) =>
    onChange({ ...simulation, ...partial })

  return (
    <Card className={styles.card}>
      <CardHeader header={<Text weight="semibold">What-If Simulator</Text>} />
      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.switchRow}>
            <Label>Delay supplier payment</Label>
            <Switch
              checked={simulation.delayPaymentEnabled}
              onChange={(_, d) => update({ delayPaymentEnabled: d.checked })}
            />
          </div>
          {simulation.delayPaymentEnabled && (
            <div className={styles.sliderRow}>
              <Label>Delay by {simulation.delayDays} days</Label>
              <Slider
                min={1}
                max={14}
                value={simulation.delayDays}
                onChange={(_, d) => update({ delayDays: d.value })}
              />
              <Badge appearance="filled" color="success">
                +SGD 1,200 for {simulation.delayDays} days
              </Badge>
            </div>
          )}
        </div>

        <div className={styles.control}>
          <div className={styles.switchRow}>
            <Label>Apply short-term loan</Label>
            <Switch
              checked={simulation.loanEnabled}
              onChange={(_, d) => update({ loanEnabled: d.checked })}
            />
          </div>
          {simulation.loanEnabled && (
            <div className={styles.sliderRow}>
              <Label>Loan amount: SGD {simulation.loanAmount.toLocaleString()}</Label>
              <Slider
                min={500}
                max={10000}
                step={500}
                value={simulation.loanAmount}
                onChange={(_, d) => update({ loanAmount: d.value })}
              />
              <Badge appearance="filled" color="informative">
                Est. interest: SGD {Math.round(simulation.loanAmount * 0.006)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Create `SimulatorPanel.module.css`**

```css
/* src/components/SimulatorPanel/SimulatorPanel.module.css */
.card {
  width: 100%;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 12px 12px;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.switchRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sliderRow {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 8px;
}
```

- [ ] **Step 3: Verify dev server still compiles**

```bash
npm run dev
```

Expected: No compile errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/SimulatorPanel/
git commit -m "feat: add SimulatorPanel with switch/slider controls"
```

---

## Task 11: FinanceCard Component

**Files:**
- Create: `src/components/FinanceCard/FinanceCard.tsx`
- Create: `src/components/FinanceCard/FinanceCard.module.css`

- [ ] **Step 1: Implement FinanceCard**

```tsx
// src/components/FinanceCard/FinanceCard.tsx
import { Card, Text, Button, Divider, Badge } from '@fluentui/react-components'
import { MoneyRegular } from '@fluentui/react-icons'
import styles from './FinanceCard.module.css'

export default function FinanceCard() {
  return (
    <Card appearance="filled" className={styles.card}>
      <div className={styles.header}>
        <MoneyRegular fontSize={20} />
        <Text weight="semibold">Short-Term Credit Available</Text>
        <Badge appearance="tint" color="informative">Personalised offer</Badge>
      </div>
      <Divider />
      <div className={styles.body}>
        <div className={styles.stat}>
          <Text size={200}>Eligible amount</Text>
          <Text weight="semibold">Up to SGD 10,000</Text>
        </div>
        <div className={styles.stat}>
          <Text size={200}>Interest (2-day bridge)</Text>
          <Text weight="semibold">~SGD 18</Text>
        </div>
        <div className={styles.stat}>
          <Text size={200}>Approval</Text>
          <Text weight="semibold">Instant</Text>
        </div>
      </div>
      <Button appearance="primary" className={styles.cta}>
        View Details
      </Button>
    </Card>
  )
}
```

- [ ] **Step 2: Create `FinanceCard.module.css`**

```css
/* src/components/FinanceCard/FinanceCard.module.css */
.card {
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.body {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cta {
  align-self: flex-start;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FinanceCard/
git commit -m "feat: add FinanceCard contextual financing prompt"
```

---

## Task 12: Dashboard Screen

**Files:**
- Modify: `src/screens/Dashboard/Dashboard.tsx`
- Create: `src/screens/Dashboard/Dashboard.module.css`

- [ ] **Step 1: Implement Dashboard screen**

```tsx
// src/screens/Dashboard/Dashboard.tsx
import { Card, CardHeader, Text, Title2 } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import CashFlowChart from '../../components/CashFlowChart/CashFlowChart'
import InsightCard from '../../components/InsightCard/InsightCard'
import FinanceCard from '../../components/FinanceCard/FinanceCard'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { state, dispatch } = useAppContext()
  const pendingInsights = state.insights.filter(i => i.status === 'pending')
  const resolvedInsights = state.insights.filter(i => i.status !== 'pending')

  return (
    <div className={styles.layout}>
      <section className={styles.heroSection}>
        <Card>
          <CardHeader
            header={
              <div className={styles.balanceHeader}>
                <div>
                  <Text size={200}>Current Balance</Text>
                  <Title2>SGD {state.balance.toLocaleString()}</Title2>
                </div>
                <Text size={200} style={{ color: '#999' }}>14-day forecast</Text>
              </div>
            }
          />
          <div className={styles.chartContainer}>
            <CashFlowChart forecast={state.forecast} />
          </div>
        </Card>
      </section>

      <section className={styles.insightsSection}>
        <Text weight="semibold" size={400}>AI Suggestions</Text>
        {pendingInsights.length === 0 && (
          <Text size={200} style={{ color: '#888' }}>No pending suggestions</Text>
        )}
        {pendingInsights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
            onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
          />
        ))}

        <FinanceCard />

        {resolvedInsights.length > 0 && (
          <>
            <Text weight="semibold" size={300} style={{ color: '#888' }}>Resolved</Text>
            {resolvedInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
                onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
              />
            ))}
          </>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Create `Dashboard.module.css`**

```css
/* src/screens/Dashboard/Dashboard.module.css */
.layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.heroSection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balanceHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
}

.chartContainer {
  padding: 0 12px 12px;
}

.insightsSection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: Dashboard shows balance card with chart, shortfall warning banner (since mock forecast goes negative), and 4 AI insight cards with Approve/Dismiss buttons.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Dashboard/
git commit -m "feat: assemble Dashboard screen with chart, insights, and finance card"
```

---

## Task 13: Simulate Screen

**Files:**
- Modify: `src/screens/Simulate/Simulate.tsx`
- Create: `src/screens/Simulate/Simulate.module.css`

- [ ] **Step 1: Implement Simulate screen**

```tsx
// src/screens/Simulate/Simulate.tsx
import { Card, CardHeader, Text, Title2, Badge } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import SimulatorPanel from '../../components/SimulatorPanel/SimulatorPanel'
import CashFlowChart from '../../components/CashFlowChart/CashFlowChart'
import { applySimulation } from '../../utils/simulateForecast'
import styles from './Simulate.module.css'

export default function Simulate() {
  const { state, dispatch } = useAppContext()
  const simulatedForecast = applySimulation(state.forecast, state.simulation)

  const baseMin = Math.min(...state.forecast.map(d => d.projectedBalance))
  const simMin = Math.min(...simulatedForecast.map(d => d.projectedBalance))
  const delta = simMin - baseMin

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Text size={400} weight="semibold">Cashflow Simulator</Text>
        <Text size={200} style={{ color: '#999' }}>
          Toggle options below to see real-time impact on your 14-day forecast
        </Text>
      </div>

      <div className={styles.grid}>
        <div className={styles.controls}>
          <SimulatorPanel
            simulation={state.simulation}
            onChange={simulation => dispatch({ type: 'SET_SIMULATION', simulation })}
          />
          <Card>
            <CardHeader header={<Text weight="semibold">Impact Summary</Text>} />
            <div className={styles.impact}>
              <div className={styles.impactRow}>
                <Text size={200}>Worst-case balance (base)</Text>
                <Text>SGD {baseMin.toLocaleString()}</Text>
              </div>
              <div className={styles.impactRow}>
                <Text size={200}>Worst-case balance (simulated)</Text>
                <Text>SGD {simMin.toLocaleString()}</Text>
              </div>
              <div className={styles.impactRow}>
                <Text size={200}>Net improvement</Text>
                <Badge appearance="filled" color={delta >= 0 ? 'success' : 'danger'}>
                  {delta >= 0 ? '+' : ''}SGD {delta.toLocaleString()}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <Card className={styles.chartCard}>
          <CardHeader header={<Text weight="semibold">Simulated Forecast</Text>} />
          <div className={styles.chartContainer}>
            <CashFlowChart forecast={simulatedForecast} />
          </div>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `Simulate.module.css`**

```css
/* src/screens/Simulate/Simulate.module.css */
.layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  align-items: start;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.impact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 12px 12px;
}

.impactRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chartCard {
  width: 100%;
}

.chartContainer {
  padding: 0 12px 12px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify in browser**

Expected: Toggling the sliders updates the chart in real-time. Impact Summary shows before/after worst-case balance. Enabling both loan and delay shows combined benefit.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Simulate/
git commit -m "feat: assemble Simulate screen with reactive forecast chart"
```

---

## Task 14: Payments Screen

**Files:**
- Modify: `src/screens/Payments/Payments.tsx`
- Create: `src/screens/Payments/Payments.module.css`

- [ ] **Step 1: Implement Payments screen**

```tsx
// src/screens/Payments/Payments.tsx
import { Card, CardHeader, Text, MessageBar, MessageBarBody } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import SupplierList from '../../components/SupplierList/SupplierList'
import styles from './Payments.module.css'

export default function Payments() {
  const { state } = useAppContext()
  const flexibleCount = state.suppliers.filter(s => s.priority === 'flexible').length

  return (
    <div className={styles.layout}>
      <Text size={400} weight="semibold">Supplier Payments</Text>

      {flexibleCount > 0 && (
        <MessageBar intent="info">
          <MessageBarBody>
            {flexibleCount} supplier{flexibleCount > 1 ? 's have' : ' has'} flexible payment
            terms — delaying could free up cash during your shortfall window.
          </MessageBarBody>
        </MessageBar>
      )}

      <Card>
        <CardHeader
          header={
            <div className={styles.cardHeaderContent}>
              <Text weight="semibold">Upcoming Payments</Text>
              <Text size={200} style={{ color: '#999' }}>Next 14 days</Text>
            </div>
          }
        />
        <div className={styles.tableContainer}>
          <SupplierList suppliers={state.suppliers} />
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create `Payments.module.css`**

```css
/* src/screens/Payments/Payments.module.css */
.layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cardHeaderContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tableContainer {
  padding: 0 4px 12px;
}
```

- [ ] **Step 3: Verify in browser**

Expected: Payments screen shows info banner about flexible suppliers, followed by a table of 6 suppliers with priority badges and tooltip-enabled action buttons.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Payments/
git commit -m "feat: assemble Payments screen with supplier table"
```

---

## Task 15: Final Polish + Global Styles

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Update `index.html` title**

Open `index.html`, change `<title>` to:
```html
<title>F&B AI Co-Pilot</title>
```

- [ ] **Step 2: Update global styles in `src/index.css`**

```css
/* src/index.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background-color: #141414;
  color: #fff;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
```

- [ ] **Step 3: Run final test suite**

```bash
npm test
```

Expected: All 20 tests PASS.

- [ ] **Step 4: Run production build to verify no build errors**

```bash
npm run build
```

Expected: `dist/` folder created with no TypeScript or Vite errors.

- [ ] **Step 5: Final commit**

```bash
git add src/index.css index.html
git commit -m "feat: add global styles and finalize prototype"
```

---

## Self-Review

### Spec Coverage Check

| PRD Requirement | Task |
|---|---|
| Vite build tool | Task 1 |
| React 18 + TypeScript 5 | Task 1 |
| Fluent UI v9 + webDarkTheme | Task 6 |
| React Router v6 (HashRouter) | Task 6 |
| react-chartjs-2 + chart.js | Tasks 1, 7 |
| CSS Modules for custom layout | All component tasks |
| All TypeScript types defined | Task 2 |
| Mock data in src/mock/ | Task 3 |
| AppContext + useReducer | Task 5 |
| APPROVE_INSIGHT / DISMISS_INSIGHT actions | Task 5 |
| Cash Flow Co-Pilot with chart | Tasks 7, 12 |
| Shortfall warning MessageBar | Task 7 |
| AI Insights Panel with Approve/Dismiss | Tasks 8, 12 |
| "Why this?" expandable section | Task 8 |
| Cashflow Simulator with Switch + Slider | Tasks 4, 10, 13 |
| Real-time chart update in Simulator | Task 13 |
| Supplier Payment table with badges | Tasks 9, 14 |
| Contextual Financing Card | Tasks 11, 12 |
| Responsive layout (mobile/tablet/desktop) | Tasks 6, 7, 9, 12, 13 |
| Routing: /, /simulate, /payments | Task 6 |
| ESLint + Prettier | Task 1 |
| Deployable static build | Task 15 |
| Post-approval state flow | Tasks 5, 12 |
| applySimulation pure function | Task 4 |

All PRD requirements covered. No gaps found.
