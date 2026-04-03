<!-- GSD:project-start source:PROJECT.md -->
## Project

**SMB F&B AI Co-Pilot**

A React + TypeScript prototype of an AI-powered banking co-pilot for small F&B business owners (cafés, hawkers, small restaurants). It shows how a banking app can move beyond transaction history to proactively predict cash flow, surface actionable AI insights, simulate financial scenarios, and support supplier payment decisions — all driven by static mock data, no backend required.

**Core Value:** An F&B owner can see a projected cash shortfall before it happens, understand exactly why the AI is recommending an action, and make a confident decision — without needing financial training.

### Constraints

- **Tech Stack**: Vite + React 18 + TypeScript 5 + Fluent UI v9 + React Router v6 (HashRouter) + Chart.js — locked per PRD
- **Data**: Static mock only — no network calls, no backend
- **Deployment**: Static file hosting (Vercel / GitHub Pages) — build must produce deployable `dist/`
- **Styling**: CSS Modules for layout; Fluent UI design tokens for component styles — no Tailwind
- **State**: `useContext` + `useReducer` only — no Redux, no Zustand
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Confirmed Installation Command
# Scaffold
# Runtime deps — pin major versions explicitly
# Dev deps
## Critical Compatibility Issues and Gotchas
### 1. react-router-dom: "latest" tag is v7 (NOT v6)
### 2. react-chartjs-2 requires explicit Chart.js component registration
### 3. Chart.js crashes in jsdom: HTMLCanvasElement.getContext is not a function
### 4. Vite 8 + @vitejs/plugin-react v6: Rolldown internals
- CSS Modules continue to work without config changes.
- The dev server still uses esbuild for fast transforms.
- If any dependency uses non-standard CommonJS patterns, Rolldown may handle them differently — unlikely for this clean stack, but worth noting if obscure packages are added.
### 5. Fluent UI v9: FluentProvider is mandatory, not optional
### 6. Fluent UI v9 tree-shaking: imports must be from package root
### 7. Fluent UI v9 + jsdom: ResizeObserver not implemented
### 8. Vitest globals require TypeScript config alignment
### 9. TypeScript: pin to ^5, not latest
## Vitest Configuration: Complete Reference
## Alternatives Considered
| Category | Locked Choice | Runner-up | Why Locked Choice Wins for This Project |
|----------|--------------|-----------|------------------------------------------|
| Router | react-router-dom v6 | react-router v7 | HashRouter static deployment; v7 migration is a rewrite |
| Charts | chart.js + react-chartjs-2 | Recharts, Victory | Canvas-based (better performance for animated forecasts); widest ecosystem |
| UI | Fluent UI v9 (webDarkTheme) | Ant Design, MUI | Enterprise/banking visual credibility; IBM-aligned |
| State | useContext + useReducer | Zustand, Redux | Sufficient for this scope; zero extra deps |
## Sources
- npm registry direct queries (all versions and peer deps verified 2026-04-03): HIGH confidence
- `npm show [package] version/peerDependencies/engines` — authoritative source
- Vite 8.0.3: Node `^20.19.0 || >=22.12.0` engine requirement confirmed from registry
- @vitejs/plugin-react v6: requires `vite ^8.0.0` confirmed from registry
- react-router-dom: `version-6` dist-tag points to 6.30.3; `latest` points to 7.14.0 — confirmed from registry dist-tags
- TypeScript 6.0.2 as `latest` confirmed from npm registry
- React 19.2.4 as `latest` confirmed (React 18.3.1 is latest 18.x)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
