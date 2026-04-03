# Domain Pitfalls

**Domain:** React 18 + TypeScript 5 + Fluent UI v9 + Chart.js fintech dashboard prototype
**Stack:** Vite, React 18, TypeScript 5, @fluentui/react-components v9, react-chartjs-2, CSS Modules, Vitest, @testing-library/react
**Researched:** 2026-04-03
**Confidence note:** WebSearch and WebFetch unavailable during research. All findings drawn from training knowledge (cutoff Aug 2025) of these stable, well-documented libraries. Confidence levels reflect source quality.

---

## Critical Pitfalls

Mistakes that cause immediate breakage, multi-hour debugging, or silent rendering failures.

---

### Pitfall 1: Missing or Misplaced FluentProvider

**What goes wrong:** Fluent UI v9 components render without design tokens — flat grey boxes, no color, broken spacing, no dark theme. Components may still mount without error, making the failure visually confusing rather than obviously broken.

**Why it happens:** Developers copy a component example without wrapping the app in `<FluentProvider theme={webDarkTheme}>`. Placing the provider inside a route rather than at the app root means nested portals (Tooltip, Popover, Dialog) escape the provider boundary and lose their tokens.

**Consequences:**
- `webDarkTheme` tokens resolve to undefined; components fall back to a no-token state that looks nothing like the banking-grade visual the demo requires
- Portalled components (Tooltip, Dialog) will always break even if the provider is placed too deep, because portals render at `document.body` level
- The shortfall MessageBar will render without the error-state color tokens, defeating its warning purpose

**Prevention:**
- Wrap in `main.tsx` — the single entry point — not in `App.tsx` or any route:
  ```tsx
  // main.tsx — CORRECT placement
  import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
  root.render(
    <FluentProvider theme={webDarkTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </FluentProvider>
  )
  ```
- FluentProvider must be the outermost wrapper, outside HashRouter, so portals inherit tokens

**Detection:** App renders but every Fluent UI component looks unstyled or dark-grey with no contrast. No console error — it fails silently.

**Phase/Task affected:** Task 1 (scaffold), Task 3 (FluentProvider + routing setup). Affects every subsequent task.

**Confidence:** HIGH — this is documented Fluent UI v9 behavior; FluentProvider is a mandatory root context.

---

### Pitfall 2: Chart.js Components Not Registered Before Use

**What goes wrong:** `react-chartjs-2` v4+ uses Chart.js 3+ tree-shaking architecture. Every chart type, scale, plugin, and element must be explicitly registered via `Chart.register(...)` before the first render. Omitting registration produces a runtime error: `"... is not a registered scale"` or silently renders an empty canvas.

**Why it happens:** Chart.js v2 auto-registered everything. The v3+ change was a breaking shift. Examples copied from older tutorials or AI suggestions skip the register call.

**Consequences:**
- `LineChart` (CashFlowChart) fails to render at all — the core feature of the demo is blank
- The confidence band dataset (fill between datasets) requires `Filler` plugin registration; missing it makes the band invisible with no error
- Error only appears at runtime, not at TypeScript compile time

**Prevention:**
```tsx
// CashFlowChart.tsx — register once, at module level (not inside component)
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,        // Required for confidence band fill
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
)
```
- Register in the chart component file, at module scope, not inside `useEffect` or the render function
- Alternative: `import { Chart as ChartJS } from 'chart.js'; ChartJS.register(...ChartJS.registerables)` registers everything — trades bundle size for safety in a prototype

**Detection:** Blank canvas or console error mentioning "not a registered scale" or "not a registered controller".

**Phase/Task affected:** Task 7 (CashFlowChart component), Task 11 (SimulatorPanel with chart update).

**Confidence:** HIGH — this is the core chart.js v3+ design; documented in their migration guide.

---

### Pitfall 3: Canvas Element Not Mocked in Vitest/jsdom

**What goes wrong:** jsdom does not implement `HTMLCanvasElement` — `getContext('2d')` returns `null`. When Vitest runs CashFlowChart tests, Chart.js attempts to call `canvas.getContext('2d')`, gets null, and throws: `"Cannot read properties of null (reading 'canvas')"` or a Chart.js internal error, crashing the test suite.

**Why it happens:** jsdom is a DOM emulator without canvas rendering. This is a known, unfixed limitation. `@testing-library/react` render calls trigger Chart.js initialization.

**Consequences:**
- All component tests that render CashFlowChart crash
- Developers may try to fix TypeScript errors rather than the real issue (missing mock)
- Hours lost if developers don't know to mock `getContext`

**Prevention:**
```ts
// src/test/setup.ts — add canvas mock
import '@testing-library/jest-dom'

// Mock canvas for Chart.js in jsdom
HTMLCanvasElement.prototype.getContext = () => null
```

Or install `jest-canvas-mock` and import it in setup:
```ts
import 'jest-canvas-mock'
```

For testing the chart renders at all (not its pixel output), mock the entire component:
```tsx
// In CashFlowChart.test.tsx
vi.mock('../components/CashFlowChart/CashFlowChart', () => ({
  CashFlowChart: () => <canvas data-testid="cash-flow-chart" />,
}))
```

**Detection:** Vitest output contains `TypeError: Cannot read properties of null` or `Cannot set properties of null` in a test that renders a component containing a `<Line>` or `<Bar>` chart.

**Phase/Task affected:** Task 13 (Vitest test suite — CashFlowChart.test.tsx). Must be resolved before any chart component test can pass.

**Confidence:** HIGH — jsdom canvas limitation is well-documented; standard solution is known.

---

### Pitfall 4: useReducer State Mutation (Silent State Corruption)

**What goes wrong:** Directly mutating state inside the reducer instead of returning new objects causes React to skip re-renders (reference equality check), producing a UI that never updates after an action is dispatched.

**Why it happens:** Spread syntax looks like it creates a new object but developers often mutate nested arrays. Common mistake in the `insights` array when approving/dismissing:

```ts
// WRONG — mutates in place, React sees same reference
case 'APPROVE_INSIGHT':
  const insight = state.insights.find(i => i.id === action.id)
  if (insight) insight.status = 'approved'  // mutation!
  return state  // same reference — React skips re-render
```

**Consequences:**
- `APPROVE_INSIGHT` / `DISMISS_INSIGHT` actions dispatch but the InsightCard status badge never updates
- The AI Insights Panel looks broken even though logic is "correct"
- Extremely hard to debug — Redux DevTools / React DevTools time-travel won't help if state reference never changes

**Prevention:**
```ts
// CORRECT — always return new objects and new arrays
case 'APPROVE_INSIGHT':
  return {
    ...state,
    insights: state.insights.map(i =>
      i.id === action.id ? { ...i, status: 'approved' } : i
    ),
  }

case 'SET_SIMULATION':
  return {
    ...state,
    simulation: { ...state.simulation, ...action.payload },
  }
```
- Rule: every `case` must `return { ...state, field: newValue }` — never `state.field = x`
- Enable TypeScript strict readonly types on AppState to get compile-time enforcement:
  ```ts
  type AppState = {
    readonly insights: readonly Insight[]
    // ...
  }
  ```

**Detection:** Action dispatches (verified via console.log), but component does not re-render. State in React DevTools shows same value before/after dispatch.

**Phase/Task affected:** Task 4 (reducer.ts), Task 8 (InsightCard actions), Task 11 (SET_SIMULATION). Core to all interactive features.

**Confidence:** HIGH — fundamental React/useReducer immutability requirement.

---

## Moderate Pitfalls

---

### Pitfall 5: Fluent UI v9 Design Tokens in CSS Modules — Wrong Usage Pattern

**What goes wrong:** Developers write CSS Module rules using hardcoded hex colors instead of Fluent UI design tokens, or try to import tokens as JavaScript values into CSS files directly. The result is a theme that ignores `webDarkTheme` and looks mismatched.

**Why it happens:** Fluent UI v9 exposes tokens as CSS custom properties on the `:root` (or the FluentProvider element), not as importable CSS variables in the traditional sense. The pattern is unfamiliar to developers used to SASS variables or Tailwind.

**Consequences:**
- Colors and spacing hardcoded in CSS Modules won't update when theme changes
- Light/dark inconsistency: some elements follow the dark theme, others are hardcoded light
- Priority badges (InsightCard) and status colors (MessageBar) look wrong

**Prevention:**
```css
/* NavBar.module.css — CORRECT: use CSS custom properties */
.container {
  background-color: var(--colorNeutralBackground1);
  border-bottom: 1px solid var(--colorNeutralStroke1);
  padding: var(--spacingHorizontalM);
}
```

```tsx
/* WRONG: importing tokens as JS into style props when CSS Modules suffice */
import { tokens } from '@fluentui/react-components'
// Avoid: style={{ background: tokens.colorNeutralBackground1 }}
// Prefer CSS Modules with var(--token-name) for layout containers
```

- Use Fluent UI components for UI primitives (they handle their own tokens)
- Reserve CSS Modules for layout structure only: grid, flex, spacing, responsive breakpoints
- Never hardcode hex colors for anything that should follow the dark theme

**Detection:** Elements look correct in light browsers but wrong when forced to dark OS theme; or elements have mixed dark/light treatment side by side.

**Phase/Task affected:** Task 5 (NavBar), Task 6 (Dashboard layout), every CSS Module file.

**Confidence:** HIGH — this is the standard Fluent UI v9 theming contract.

---

### Pitfall 6: HashRouter Base URL and Vite Build Asset Paths

**What goes wrong:** Static build deploys successfully but assets (JS chunks, CSS) 404 on paths deeper than `/`. When deploying to GitHub Pages under a sub-path (e.g. `username.github.io/smb-fnb-ai-copilot/`), absolute asset paths like `/assets/index.js` break.

**Why it happens:** Vite defaults `base` to `/`. HashRouter handles the `#` fragment routing correctly, but Vite still generates absolute asset references in `index.html`. On sub-path deployments, the browser requests `/assets/...` instead of `/smb-fnb-ai-copilot/assets/...`.

**Consequences:**
- App shows blank white screen on deployed URL
- Works locally (`npm run dev`, `npm run preview`) but breaks on Vercel/GitHub Pages sub-path

**Prevention:**
```ts
// vite.config.ts — set base for sub-path deployment
export default defineConfig({
  base: '/smb-fnb-ai-copilot/',  // match GitHub Pages repo name
  // OR: base: './' for relative paths (safer for unknown deployment targets)
  plugins: [react()],
})
```
- HashRouter itself needs no configuration for routing — it uses the fragment
- The `base` setting only affects asset loading, not route matching
- If deploying to root of a domain (Vercel custom domain), `base: '/'` is correct

**Detection:** Deployed app shows blank page; DevTools Network tab shows 404 for JS/CSS assets. Works with `npm run preview` at localhost.

**Phase/Task affected:** Task 15 (production build + deploy). Catch before deployment, not after.

**Confidence:** HIGH — Vite base URL behavior is well-documented.

---

### Pitfall 7: TypeScript Strict Mode and Fluent UI v9 Component Props

**What goes wrong:** With `strict: true` in tsconfig, developers hit type errors when passing standard HTML props to Fluent UI components, or when trying to extend component props with custom variants. The most common issue: `makeStyles` return type being used with `mergeClasses` incorrectly, producing a `string | undefined` type error.

**Why it happens:** Fluent UI v9's `makeStyles` hook returns `Record<string, string>` (slot names to class strings). Using optional chaining or conditional application with `mergeClasses` triggers strict null checks.

**Consequences:**
- Build breaks on `mergeClasses(styles.container, isActive && styles.active)` — `boolean | string` is not assignable to `string`
- Type errors in InsightCard (conditional badge color) and SimulatorPanel (conditional slider disabled state)

**Prevention:**
```tsx
// WRONG — boolean can slip into mergeClasses
mergeClasses(styles.container, isActive && styles.active)

// CORRECT — always pass string or undefined, never boolean
mergeClasses(styles.container, isActive ? styles.active : undefined)
```

For custom variants on Fluent UI components:
```tsx
// Avoid extending Fluent UI base types directly
// Use composition over prop extension
const MyBadge = ({ variant }: { variant: 'warning' | 'success' }) => (
  <Badge color={variant === 'warning' ? 'warning' : 'success'} />
)
```

**Detection:** TypeScript compile error during `npm run build` mentioning `string | boolean` not assignable to `string`. May not surface during dev due to transpile-only mode.

**Phase/Task affected:** Task 8 (InsightCard with status badges), Task 10 (SupplierList with priority badges).

**Confidence:** HIGH — `mergeClasses` signature is strictly typed; this is a common first encounter with Fluent v9 patterns.

---

### Pitfall 8: react-chartjs-2 Dataset Object Mutation Causing Stale Chart

**What goes wrong:** Passing the same dataset object reference to `<Line data={chartData} />` between renders causes react-chartjs-2 to skip updates. The chart appears stuck on the initial data even when the simulation state changes.

**Why it happens:** react-chartjs-2 performs a shallow reference check on the `data` prop. If the parent re-renders but passes the same object reference (mutated in place), the chart does not update.

**Consequences:**
- SimulatorPanel slider changes state correctly, `applySimulation` computes new forecast, but the chart never redraws
- The core "real-time chart update" requirement silently fails

**Prevention:**
```tsx
// useSimulatedForecast.ts — always return new array/object references
const simulatedData = useMemo(() => {
  return applySimulation(baseForecast, simulation)
}, [baseForecast, simulation])

// In SimulatorPanel — build chartData as new object every time
const chartData = useMemo(() => ({
  labels: simulatedData.map(d => d.date),
  datasets: [{
    data: simulatedData.map(d => d.projectedBalance),
    // ...
  }],
}), [simulatedData])
```

- `applySimulation` must return a new array each call (the project plan specifies a pure function — this enforces it)
- Use `useMemo` with simulation state as dependency to ensure new reference on simulation change

**Detection:** Slider moves, console shows new state values, but chart does not redraw. Add `console.log('chart data changed', chartData)` inside component to verify reference change.

**Phase/Task affected:** Task 11 (SimulatorPanel reactive chart update). Direct failure of a core requirement.

**Confidence:** HIGH — react-chartjs-2 reference equality check is standard React reconciliation behavior, well-known in the library's issue tracker.

---

### Pitfall 9: Vitest + @testing-library/react — Missing act() Wrapping for State Updates

**What goes wrong:** Tests that trigger user interactions (clicking Approve on InsightCard) and then assert on the updated state fail with warnings: `"Warning: An update to ... inside a test was not wrapped in act(...)"`. In some cases the assertion runs before the state update completes.

**Why it happens:** `@testing-library/react`'s `userEvent` v14+ is async; using `fireEvent` (synchronous) for actions that trigger `useReducer` dispatch may not flush state updates before assertions.

**Consequences:**
- InsightCard approve/dismiss tests are flaky (pass/fail non-deterministically)
- Developers waste time adjusting assertions rather than fixing the async handling

**Prevention:**
```tsx
// CORRECT — use userEvent and await
import userEvent from '@testing-library/user-event'

test('approving insight updates status', async () => {
  const user = userEvent.setup()
  render(<InsightCard insight={mockInsight} />)
  await user.click(screen.getByRole('button', { name: /approve/i }))
  expect(screen.getByText('Approved')).toBeInTheDocument()
})
```

- Install `@testing-library/user-event` explicitly (it is separate from `@testing-library/react`)
- Always `await` user interactions; mark test functions `async`
- Do not use `fireEvent` for click tests on components that dispatch to context

**Detection:** Console warns about `act()` during test run; tests are sometimes green, sometimes red.

**Phase/Task affected:** Task 13 (InsightCard.test.tsx, SupplierList.test.tsx).

**Confidence:** HIGH — @testing-library/react async patterns are well-documented; userEvent v14 async-by-default is a known migration point.

---

## Minor Pitfalls

---

### Pitfall 10: Fluent UI v9 Accordion / Disclosure for "Why This?" Section

**What goes wrong:** Using a plain `<details>` HTML element or a custom toggle for the "Why this?" expandable section in InsightCard instead of a Fluent UI component causes styling inconsistency and accessibility issues (no `aria-expanded` management).

**Prevention:** Use `<Accordion>` from `@fluentui/react-components`. It handles `aria-expanded`, keyboard navigation, and token-based styling automatically. The component is available in Fluent v9 and fits the expand/collapse pattern exactly.

**Phase/Task affected:** Task 8 (InsightCard "Why this?" section).

**Confidence:** HIGH.

---

### Pitfall 11: CSS Modules Class Name Collisions with Fluent UI Class Names

**What goes wrong:** Fluent UI v9 uses `makeStyles` to inject globally-scoped class names (e.g., `fui-Button`, `fui-Badge`). Custom CSS Module class names that accidentally match Fluent's generated patterns can cause unintended style overrides.

**Prevention:**
- Keep CSS Module class names semantic and component-scoped: `.insightCard`, `.priorityBadge`, `.chartContainer`
- Never target Fluent UI's generated class names in CSS Modules (they are unstable across versions)
- Use component `className` prop only for layout — never for internal component styling

**Phase/Task affected:** All CSS Module files.

**Confidence:** MEDIUM — class name collision risk is real but unlikely in practice if naming discipline is followed.

---

### Pitfall 12: `@testing-library/jest-dom` Not Extending Vitest Matchers

**What goes wrong:** `toBeInTheDocument()`, `toHaveTextContent()` and other jest-dom matchers throw `TypeError: expect(...).toBeInTheDocument is not a function` even after importing `@testing-library/jest-dom`.

**Why it happens:** Vitest uses its own `expect` — the import in `setup.ts` must use the Vitest-compatible import path, or `globals: true` must be set in vite.config.ts for the matchers to extend the global `expect`.

**Prevention:**
```ts
// src/test/setup.ts — correct import for Vitest
import '@testing-library/jest-dom/vitest'
// OR if using older @testing-library/jest-dom:
import '@testing-library/jest-dom'
// AND ensure vite.config.ts has globals: true
```

Verify `vite.config.ts`:
```ts
test: {
  globals: true,           // required for jest-dom matchers to work
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

**Phase/Task affected:** Task 1 (test setup), Task 13 (all tests). Foundational — if wrong, no jest-dom matcher works.

**Confidence:** HIGH — this is a common Vitest onboarding issue.

---

### Pitfall 13: Slider Component Value Type Mismatch (Fluent UI Slider)

**What goes wrong:** The Fluent UI v9 `Slider` component's `onChange` handler provides the value as a number but the event signature includes both a synthetic event and a `{ value: number }` data object. Destructuring incorrectly or treating the value as a string breaks `SET_SIMULATION` dispatch.

**Prevention:**
```tsx
// CORRECT — destructure data object, not event
<Slider
  value={simulation.delayDays}
  min={0}
  max={30}
  onChange={(_ev, data) => dispatch({
    type: 'SET_SIMULATION',
    payload: { delayDays: data.value }
  })}
/>
```

**Phase/Task affected:** Task 11 (SimulatorPanel sliders).

**Confidence:** HIGH — Fluent UI v9 uses a consistent `(event, data)` callback pattern across all interactive components.

---

### Pitfall 14: Switch Component Controlled vs Uncontrolled in SimulatorPanel

**What goes wrong:** Using Fluent UI `Switch` in uncontrolled mode (no `checked` prop, only `defaultChecked`) means the switch does not reflect the AppContext simulation state. After dismissing a simulation or resetting state, the switch visually stays toggled while the context says otherwise.

**Prevention:**
```tsx
// CORRECT — always controlled
<Switch
  checked={simulation.delayPaymentEnabled}
  onChange={(_ev, data) => dispatch({
    type: 'SET_SIMULATION',
    payload: { delayPaymentEnabled: data.checked }
  })}
/>
```

**Phase/Task affected:** Task 11 (SimulatorPanel).

**Confidence:** HIGH — uncontrolled vs controlled is a React fundamental; Fluent UI v9 supports both but prototypes with global state should always use controlled.

---

### Pitfall 15: Vite Dev Server CSS Modules Hot Reload Breaking Fluent UI Portals

**What goes wrong:** During development, rapid CSS Module file saves can cause Vite's HMR to temporarily disconnect Fluent UI's CSS custom properties, making portalled components (Tooltip, Popover) flash unstyled for a moment. This is not a production issue but wastes debugging time.

**Prevention:** This is a cosmetic development-only issue. No action required — refresh the page if it happens. Do not investigate further during active development.

**Phase/Task affected:** All development tasks. Known Vite + Fluent UI HMR interaction.

**Confidence:** MEDIUM — reported pattern in community; not officially documented.

---

## Phase-Specific Warnings

| Phase / Task | Likely Pitfall | Mitigation |
|---|---|---|
| Task 1: Scaffold + Dependencies | jest-dom matchers not working (Pitfall 12) | Set `globals: true` in vite.config.ts immediately |
| Task 1: Scaffold + Dependencies | Canvas mock missing (Pitfall 3) | Add `HTMLCanvasElement.prototype.getContext = () => null` to setup.ts from the start |
| Task 3: FluentProvider + Routing | Missing/misplaced FluentProvider (Pitfall 1) | Wrap in main.tsx, outside HashRouter, webDarkTheme passed directly |
| Task 4: AppContext + reducer | useReducer mutation bugs (Pitfall 4) | Enforce spread pattern; add `readonly` modifiers to AppState type |
| Task 6/7/8/9/10: All CSS Modules | Hardcoded colors instead of tokens (Pitfall 5) | Use only CSS custom properties from Fluent tokens for all color/spacing |
| Task 7: CashFlowChart | Chart.js registration missing (Pitfall 2) | Register Filler plugin — required for confidence band fill |
| Task 7: CashFlowChart | react-chartjs-2 stale reference (Pitfall 8) | Wrap chartData in useMemo with simulation dependency |
| Task 11: SimulatorPanel | Slider/Switch type mismatch (Pitfalls 13, 14) | Always use `(_ev, data)` destructuring; always controlled |
| Task 13: Vitest tests | Canvas crash in jsdom (Pitfall 3) | Verify mock in setup.ts before running any chart tests |
| Task 13: Vitest tests | Async act() warnings (Pitfall 9) | Use userEvent + async/await for all interaction tests |
| Task 15: Vite build + deploy | Asset 404 on sub-path deployment (Pitfall 6) | Set `base: './'` in vite.config.ts if deploying to GitHub Pages sub-path |

---

## Sources

All findings from training knowledge (React 18, Fluent UI v9, Chart.js v3+, react-chartjs-2 v4+, Vitest, @testing-library/react documentation patterns up to Aug 2025 cutoff). External verification was not available during this research session (WebSearch and WebFetch denied). These pitfalls are based on the official documented behavior of each library.

| Pitfall | Confidence | Basis |
|---|---|---|
| FluentProvider placement (1) | HIGH | Official Fluent UI v9 design — provider is required context |
| Chart.js registration (2) | HIGH | Chart.js v3+ breaking change; official migration docs |
| Canvas mock in jsdom (3) | HIGH | jsdom limitation; standard jest-canvas-mock / manual mock pattern |
| useReducer mutation (4) | HIGH | React core immutability requirement |
| CSS token usage (5) | HIGH | Fluent UI v9 theming contract |
| Vite base URL (6) | HIGH | Vite official configuration |
| TypeScript mergeClasses (7) | HIGH | Fluent UI v9 makeStyles API type signature |
| react-chartjs-2 references (8) | HIGH | React reconciliation + react-chartjs-2 known pattern |
| act() async wrapping (9) | HIGH | @testing-library/react v14 userEvent async-by-default |
| jest-dom Vitest matchers (12) | HIGH | Vitest globals config requirement |
| Slider/Switch controlled (13, 14) | HIGH | Fluent UI v9 event callback signature |
