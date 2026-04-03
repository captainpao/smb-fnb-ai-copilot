# Technology Stack

**Project:** SMB F&B AI Co-Pilot
**Researched:** 2026-04-03
**Scope:** Version verification and setup gotchas for the locked stack. Not a recommendation exercise.

---

## Exact Package Versions (Verified via npm registry, 2026-04-03)

### Runtime Dependencies

| Package | Pin Version | Latest in Range | Notes |
|---------|-------------|-----------------|-------|
| `react` | `^18.3.1` | 18.3.1 | Latest 18.x patch. React 19.x is now `latest` on npm — pin `^18` explicitly or npm may not upgrade |
| `react-dom` | `^18.3.1` | 18.3.1 | Must match React version exactly |
| `@fluentui/react-components` | `^9.73.7` | 9.73.7 | Peer requires `react >=16.14.0 <20.0.0` — React 18 confirmed compatible |
| `@fluentui/react-icons` | `^2.0.323` | 2.0.323 | Peer requires `react >=16.8.0 <20.0.0` — React 18 confirmed compatible |
| `react-router-dom` | `^6.30.3` | 6.30.3 | v6 is published under `version-6` dist-tag; `latest` tag now points to v7.14.0 — **must pin `^6` explicitly** |
| `chart.js` | `^4.5.1` | 4.5.1 | v4 is the current stable series |
| `react-chartjs-2` | `^5.3.1` | 5.3.1 | Peer requires `chart.js ^4.1.1` and `react ^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` — confirmed |

### Build / Dev Infrastructure

| Package | Pin Version | Notes |
|---------|-------------|-------|
| `vite` | `^8.0.3` | Requires Node.js `^20.19.0 \|\| >=22.12.0`. v8 uses Rolldown internally (significant architectural change from v5). `create-vite@9` scaffolds Vite 8. |
| `@vitejs/plugin-react` | `^6.0.1` | Requires `vite ^8.0.0`. Use this (Babel-based, HMR) — not `plugin-react-swc` which skips Babel transforms |
| `typescript` | `^5.9.3` | TypeScript 6 is now latest on npm — pin `^5` explicitly |
| `vitest` | `^4.1.2` | Requires Node `^20.0.0 \|\| ^22.0.0 \|\| >=24.0.0`. Peer requires `vite ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` — Vite 8 confirmed |
| `jsdom` | `^29.0.1` | Must be installed as an explicit dev dep for `vitest environment: 'jsdom'` (not bundled) |
| `@testing-library/react` | `^16.3.2` | Peer requires `react ^18.0.0 \|\| ^19.0.0` — React 18 confirmed |
| `@testing-library/jest-dom` | `^6.9.1` | No peer dep constraints; type augments Jest/Vitest `expect` matchers |
| `@testing-library/dom` | `^10.4.1` | Transitive dep of `@testing-library/react`; install explicitly if running DOM assertions directly |
| `@vitest/ui` | `^4.1.2` | Optional; must match vitest exact minor |
| `@types/react` | `^18.3.28` | Must stay in `^18`, not `^19` — Fluent UI v9 peer requires `@types/react <20.0.0` |
| `@types/react-dom` | `^18.3.7` | Same — keep in `^18` range |
| `jest-canvas-mock` | `^2.5.2` | Required in test setup to prevent `HTMLCanvasElement.getContext` crash in jsdom when rendering Chart.js |

---

## Confirmed Installation Command

```bash
# Scaffold
npm create vite@latest smb-fnb-ai-copilot -- --template react-ts
cd smb-fnb-ai-copilot

# Runtime deps — pin major versions explicitly
npm install react@^18.3.1 react-dom@^18.3.1
npm install @fluentui/react-components@^9 @fluentui/react-icons
npm install react-router-dom@^6          # CRITICAL: "latest" is v7; must pin ^6
npm install chart.js react-chartjs-2

# Dev deps
npm install -D vitest@^4 @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D jest-canvas-mock          # for Chart.js + jsdom
npm install -D @types/react@^18 @types/react-dom@^18
npm install -D typescript@^5             # TypeScript 6 is latest; pin ^5
```

---

## Critical Compatibility Issues and Gotchas

### 1. react-router-dom: "latest" tag is v7 (NOT v6)

**Severity: HIGH**

Running `npm install react-router-dom` without a version specifier installs v7.14.0. React Router v7 is a breaking rewrite that removes `HashRouter` as a standalone export in some configurations and changes the routing model entirely.

The project is locked to `HashRouter` (v6 API). Always install with `react-router-dom@^6` or pin `"react-router-dom": "^6.30.3"` in `package.json`.

```ts
// v6 import — confirmed correct for this project
import { HashRouter, Route, Routes } from 'react-router-dom'
```

### 2. react-chartjs-2 requires explicit Chart.js component registration

**Severity: HIGH**

Chart.js v4 uses a tree-shakable architecture. Nothing renders if you forget to register. Every chart type, scale, and plugin must be registered before use.

```ts
// src/components/CashFlowChart/CashFlowChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,       // required for area/band fill
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)
```

For the cash flow chart with confidence bands (fill between datasets), `Filler` plugin registration is non-negotiable. Without it, `fill: true` or `fill: '+1'` silently produces no shaded area.

The alternative `import { Chart as ChartJS } from 'chart.js/auto'` registers everything but defeats tree-shaking — avoid in production builds.

### 3. Chart.js crashes in jsdom: HTMLCanvasElement.getContext is not a function

**Severity: HIGH** (test suite will not run without this fix)

jsdom does not implement the Canvas API. Any test that renders a component containing a `<canvas>` (via `<Line>` or `<Bar>` from react-chartjs-2) will throw:

```
Error: Not implemented: HTMLCanvasElement.prototype.getContext
```

Fix: import `jest-canvas-mock` in the Vitest setup file.

```ts
// src/test/setup.ts
import 'jest-canvas-mock'                 // must be before any chart imports
import '@testing-library/jest-dom'
```

`jest-canvas-mock` works with Vitest — the name is historical, not Jest-only.

### 4. Vite 8 + @vitejs/plugin-react v6: Rolldown internals

**Severity: MEDIUM (awareness only)**

Vite 8 uses Rolldown (Rust-based bundler) as its internal bundler, replacing esbuild for production builds. This is generally transparent for this stack, but:

- CSS Modules continue to work without config changes.
- The dev server still uses esbuild for fast transforms.
- If any dependency uses non-standard CommonJS patterns, Rolldown may handle them differently — unlikely for this clean stack, but worth noting if obscure packages are added.

`@vitejs/plugin-react` v6 requires Vite `^8.0.0` — do not use v5 of the plugin with Vite 8.

### 5. Fluent UI v9: FluentProvider is mandatory, not optional

**Severity: HIGH**

Fluent UI v9 components render without visible styling if not wrapped in `<FluentProvider>`. They will not crash — they will just look broken (no tokens applied). This is a common mistake when wiring up the app entry point.

```tsx
// src/main.tsx — correct setup
import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webDarkTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </FluentProvider>
  </React.StrictMode>,
)
```

`FluentProvider` must be an ancestor of all Fluent UI components. One provider at the root is sufficient for single-theme apps. Nesting additional providers is only needed for per-section theme overrides.

### 6. Fluent UI v9 tree-shaking: imports must be from package root

**Severity: LOW (performance)**

Fluent UI v9 is fully tree-shakable when you import from `@fluentui/react-components` (the package root). Do NOT import from deep paths like `@fluentui/react-components/dist/unstable` — these are internal.

```ts
// Correct — tree-shaken by Vite/Rolldown
import { Button, MessageBar, Card } from '@fluentui/react-components'

// Incorrect — bypasses tree-shaking, imports entire bundle
import * as FluentUI from '@fluentui/react-components'
```

### 7. Fluent UI v9 + jsdom: ResizeObserver not implemented

**Severity: MEDIUM** (specific tests may fail)

Several Fluent UI v9 components (`Accordion`, `Popover`, `Menu`, overflow utilities) use `ResizeObserver` internally. jsdom does not implement it.

Add a mock to the test setup:

```ts
// src/test/setup.ts — add before component test imports
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

This project's tested components (`CashFlowChart`, `InsightCard`, `SupplierList`) are unlikely to trigger this directly, but adding the mock preemptively prevents noise from Fluent UI internals.

### 8. Vitest globals require TypeScript config alignment

**Severity: MEDIUM**

Using `globals: true` in `vitest.config` means `describe`, `it`, `expect` etc. are available without imports. This requires TypeScript to know about them too, or it will emit type errors on `expect(...)` calls.

```json
// tsconfig.json — add to compilerOptions
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

Alternatively (preferred for strict separation):

```ts
// vitest.config.ts
/// <reference types="vitest" />
```

Without one of these, `tsc --noEmit` fails even though `vitest run` succeeds.

### 9. TypeScript: pin to ^5, not latest

**Severity: LOW (future-proofing)**

TypeScript 6.0.2 is now the `latest` tag on npm. TypeScript 6 introduced several breaking changes to type inference and strict checks that could break Fluent UI v9's internal types (which were tested against TypeScript 5.x). Pin `typescript@^5` in `package.json`. TypeScript 5.9.3 is the latest stable 5.x release.

---

## Vitest Configuration: Complete Reference

```ts
// vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,          // enables CSS Modules in tests (avoids classname resolution errors)
  },
})
```

```ts
// src/test/setup.ts
import 'jest-canvas-mock'

import '@testing-library/jest-dom'

// Fluent UI v9 ResizeObserver polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

---

## Alternatives Considered

Not applicable — stack is locked. Documented for decision log completeness only.

| Category | Locked Choice | Runner-up | Why Locked Choice Wins for This Project |
|----------|--------------|-----------|------------------------------------------|
| Router | react-router-dom v6 | react-router v7 | HashRouter static deployment; v7 migration is a rewrite |
| Charts | chart.js + react-chartjs-2 | Recharts, Victory | Canvas-based (better performance for animated forecasts); widest ecosystem |
| UI | Fluent UI v9 (webDarkTheme) | Ant Design, MUI | Enterprise/banking visual credibility; IBM-aligned |
| State | useContext + useReducer | Zustand, Redux | Sufficient for this scope; zero extra deps |

---

## Sources

- npm registry direct queries (all versions and peer deps verified 2026-04-03): HIGH confidence
- `npm show [package] version/peerDependencies/engines` — authoritative source
- Vite 8.0.3: Node `^20.19.0 || >=22.12.0` engine requirement confirmed from registry
- @vitejs/plugin-react v6: requires `vite ^8.0.0` confirmed from registry
- react-router-dom: `version-6` dist-tag points to 6.30.3; `latest` points to 7.14.0 — confirmed from registry dist-tags
- TypeScript 6.0.2 as `latest` confirmed from npm registry
- React 19.2.4 as `latest` confirmed (React 18.3.1 is latest 18.x)
