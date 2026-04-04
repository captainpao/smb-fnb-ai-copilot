# Product Requirements Document (PRD)
## Product Name: SMB F&B AI Co-Pilot (Banking App Prototype)

---

## 1. Objective

Design a React + TypeScript prototype showing how an SMB banking app can become an AI-powered business co-pilot for small F&B owners.

The prototype will:
- Show proactive insights (AI)
- Enable decision support (simulation + actions)
- Maintain user trust and control

---

## 1a. Design System — Microsoft Fluent UI v9

This prototype uses **[Microsoft Fluent UI React Components v9](https://react.fluentui.dev/)** (`@fluentui/react-components`) as the primary design system.

### Rationale
- Enterprise-grade, accessibility-first component library
- Consistent with Microsoft / banking-grade UX conventions
- Rich set of components: Cards, Badges, Tokens, Dialogs, Tables, Toggles, Sliders
- Built-in theming via `FluentProvider` with light/dark mode support

### Setup
```bash
npm install @fluentui/react-components@9 @fluentui/react-icons
```

```tsx
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

<FluentProvider theme={webDarkTheme}>
  <App />
</FluentProvider>
```

### Theme
- **Base theme:** `webDarkTheme` (banking/fintech feel)
- **Accent colour:** Fluent `colorBrandBackground` (blue) for CTAs
- **Danger/Alert:** `colorPaletteRedBackground3` for cash-flow warnings
- **Success:** `colorPaletteGreenBackground3` for positive indicators

---

## 2. Target Users

### Primary User
- Small F&B business owner (café, hawker, small restaurant)
- Not financially trained
- Time-constrained, operationally focused

### Key Behaviours
- Checks bank balance daily
- Makes quick decisions based on gut feel
- Uses multiple disconnected tools (POS, accounting, WhatsApp)

---

## 3. Problem Summary

Users lack:
- Forward visibility of cash flow
- Decision support for daily trade-offs
- Integrated view across business tools
- Time to manage admin tasks
- Trust in automation

---

## 4. Solution Overview

A bank-integrated AI dashboard that:
- Predicts short-term cash flow
- Surfaces actionable insights
- Allows scenario simulation
- Supports decision-making with transparency

---

## 5. Core Features (Scope for Prototype)

### Cash Flow Co-Pilot (Hero)
- Displays current balance + 7–14 day forecast
- Highlights risk of shortfall

**UI (Fluent UI):**
- `Card` + `CardHeader` — balance summary container
- Chart.js line chart inside a `Card`
- `MessageBar` (`intent="warning"`) — shortfall alert banner
- `DataGrid` or stacked `Text` — breakdown panel (rent, suppliers, payroll)

### AI Insights Panel
- Ranked list of AI-generated recommendations
- Examples: Delay supplier payment, reduce inventory, take short-term financing

**UI (Fluent UI):**
- `Card` per insight with `CardHeader` and `CardFooter`
- `Badge` (`appearance="filled"`, colour-coded) — confidence indicator (Low / Medium / High)
- `Accordion` — expandable "Why this?" section
- `Button` (`appearance="primary"`) — Approve action
- `Button` (`appearance="subtle"`) — Dismiss action

### Cashflow Simulator (Key Differentiator)
- Users test "what-if" scenarios
- Examples: Toggle delay payment, toggle loan → see impact

**UI (Fluent UI):**
- `Switch` — toggle scenarios on/off
- `Slider` — adjust loan amount / days delayed
- Real-time Chart.js update inside `Card`
- `Badge` — delta indicators (positive/negative impact)

### Supplier Payment Optimizer
- Shows upcoming payments and AI recommendations

**UI (Fluent UI):**
- `DataGrid` — supplier list (name, amount, due date)
- `Badge` — tags: `"Flexible"` (green) / `"High Priority"` (red)
- `Button` — suggested action buttons per row
- `Tooltip` — hover detail on recommendations

### Contextual Financing Prompt
- Non-intrusive loan suggestion based on need

**UI (Fluent UI):**
- `Card` (`appearance="filled"`) — inline financing card
- `Text` — cost vs benefit summary
- `Button` (`appearance="primary"`) — CTA "View Details"
- `Divider` — visual separation from surrounding content

### Daily Business Insight (Explainer)
- AI-generated explanation of daily performance

**UI (Fluent UI):**
- `Card` with `CardPreview` — natural language summary block
- `Body1` / `Caption1` typography tokens — supporting metrics
- `ProgressBar` — visual metric indicators

---

## 6. AI Behaviour (Prototype Logic)

Prototype uses mocked data + rule-based logic.

**Example rules:**
- Projected balance < threshold → show alert
- Supplier due soon + low cash → suggest delay
- Shortfall + stable revenue → suggest loan

**Transparency Requirements:**
- Show "Why this suggestion" and data sources
- Use phrases like "Based on your recent transactions…"

---

## 7. Trust & Control Features

- No auto-execution of actions
- "Approve / Dismiss" for every suggestion
- "Why this?" explanations
- Optional: AI Control Settings panel (toggle features on/off)

---

## 8. UX Structure (High-Level)

### Main Screens:
1. **Dashboard (Home)** — cash flow chart, alerts, AI insights
2. **Simulation View** — interactive scenario testing
3. **Payments View** — supplier list, recommended actions
4. **Insights Detail** *(Optional)* — deep dive into AI reasoning

### Routing (React Router v6)

```
/           → Dashboard
/simulate   → Simulation View
/payments   → Payments View
/insights/:id  → Insight Detail (optional)
```

Navigation is rendered as a `TabList` that drives `react-router-dom` `<Link>` components. `HashRouter` is used so the demo deploys as static files without server-side routing config.

### Responsive Design

Target users check balances daily, primarily on mobile. Layout must work across breakpoints:

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Single-column stack; charts full-width; TabList at bottom as nav bar |
| 768px–1024px (tablet) | Two-column grid; side-by-side chart + insights |
| > 1024px (desktop) | Three-column dashboard layout |

Use CSS Grid with responsive column definitions. Fluent UI spacing tokens handle gutters. No horizontal scrolling on mobile.

---

## 9. User Flow (Core Journey)

1. User opens dashboard
2. Sees alert: *"Cash shortfall in 5 days"*
3. Reviews AI suggestions
4. Opens simulator
5. Tests options (delay payment vs loan)
6. Chooses preferred action
7. Confirms decision

---

## 10. Technical Requirements (Frontend)

### Stack
- **Build tool:** Vite (`react-ts` template)
- React 18 (functional components)
- TypeScript 5
- **UI Library: `@fluentui/react-components` v9 (Fluent UI)**
- **Icons: `@fluentui/react-icons`**
- **Routing:** React Router v6 (`HashRouter` for static demo deployment)
- State management: React `useContext` + `useReducer`
- **Charting:** `react-chartjs-2` + `chart.js`
- **Styling:** CSS Modules for custom layouts; Fluent UI design tokens for component-level styles

### Project Scaffolding

```bash
npm create vite@latest smb-fnb-ai-copilot -- --template react-ts
cd smb-fnb-ai-copilot
npm install @fluentui/react-components@9 @fluentui/react-icons
npm install react-router-dom
npm install chart.js react-chartjs-2
```

### Dev Tooling
- **Linting:** ESLint with `@typescript-eslint` + `eslint-plugin-react`
- **Formatting:** Prettier
- **Dev server:** Vite HMR (instant hot reload)
- **Build:** `vite build` → static assets deployable to Vercel / GitHub Pages

### Fluent UI Component Mapping

| Feature | Fluent UI Components |
|---|---|
| Layout shell | `FluentProvider`, `tokens` for spacing |
| Navigation | `TabList`, `Tab` |
| Alerts / Banners | `MessageBar`, `MessageBarBody` |
| Insight Cards | `Card`, `CardHeader`, `CardFooter`, `Badge` |
| Simulator controls | `Switch`, `Slider`, `Label` |
| Supplier table | `DataGrid`, `DataGridRow`, `DataGridCell` |
| Dialogs / Confirmations | `Dialog`, `DialogSurface`, `DialogActions` |
| Buttons | `Button` (primary / subtle / outline) |
| Expandable sections | `Accordion`, `AccordionItem` |
| Tooltips | `Tooltip` |
| Typography | `Title1`, `Title2`, `Body1`, `Caption1` tokens |

### Component Structure (Suggested)
- `Dashboard`
- `CashFlowChart`
- `InsightCard`
- `Simulator`
- `SupplierList`
- `FinanceCard`

### Data Models

```ts
type Transaction = {
  id: string
  date: string          // ISO 8601 e.g. "2024-01-15"
  amount: number        // positive value; direction determined by type
  type: "credit" | "debit"
  category: "sales" | "supplier" | "rent" | "payroll"
}

type ForecastData = {
  date: string          // ISO 8601
  projectedBalance: number
  lowerBound: number    // confidence interval low
  upperBound: number    // confidence interval high
}

type Insight = {
  id: string
  title: string
  description: string
  reasoning: string     // shown in "Why this?" expandable
  impact: number        // cash impact in currency units
  confidence: "low" | "medium" | "high"
  status: "pending" | "approved" | "dismissed"
}

type Supplier = {
  id: string
  name: string
  amount: number
  dueDate: string       // ISO 8601
  priority: "flexible" | "high-priority"
  aiRecommendation: string
}

type SimulationState = {
  delayPaymentEnabled: boolean
  delayDays: number           // 0–30
  loanEnabled: boolean
  loanAmount: number          // in currency units
}
```

### App State

```ts
type AppState = {
  balance: number
  forecast: ForecastData[]
  insights: Insight[]
  suppliers: Supplier[]
  simulation: SimulationState
  transactions: Transaction[]
}
```

### Mock Data Strategy

All data is static TypeScript constants located in `src/mock/`:

```
src/mock/
  transactions.ts   — 30 days of sample transactions
  forecast.ts       — 14-day projected balance array
  insights.ts       — 3–5 pre-authored AI insights
  suppliers.ts      — 5–6 supplier records
```

The `useReducer` state is seeded from these constants at app init. No network calls are made. The Simulator computes derived forecast data reactively from `SimulationState` using a pure function.

### Action Flow (Post-Approval)

When a user approves an insight:
1. Dispatch `APPROVE_INSIGHT` action with `id`
2. Reducer sets `insight.status = "approved"`
3. If the insight has a cash impact, the forecast is recalculated via `applyInsightToForecast()`
4. UI updates to show confirmed state; approved insight moves to a "Confirmed Actions" section

---

## 10c. Deployment

- **Target:** Static file hosting (Vercel or GitHub Pages)
- **Build command:** `vite build` → outputs to `dist/`
- **Base URL config:** Set `base` in `vite.config.ts` if deploying to a subpath
- **Demo access:** Single shareable URL; no auth required for prototype

---

## 11. Success Criteria (for Demo)

### UX Success
- User understands problem within 5 seconds
- AI suggestions feel helpful, not intrusive
- Simulation clearly shows impact

### Product Success
- Demonstrates shift: reactive → proactive
- Demonstrates shift: data → decision support

---

## 12. Out of Scope

- Real API integrations (POS, accounting)
- Full loan application flow
- Complex inventory management
- Backend AI/ML models

---

## 13. Demo Narrative

> "This prototype shows how a banking app can move beyond transactions to become a daily decision-making tool for F&B owners—using AI to predict, explain, and recommend, while keeping the user in control."
