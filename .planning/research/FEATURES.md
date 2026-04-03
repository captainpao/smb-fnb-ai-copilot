# Feature Landscape

**Domain:** Fintech dashboard prototype — AI-powered financial co-pilot for SMB F&B owners
**Researched:** 2026-04-03
**Confidence note:** WebSearch and Brave Search unavailable in this session. All findings drawn from training knowledge of established fintech UX conventions (Robinhood, Revolut, Xero, QuickBooks, Wise, Mercury, Brex design patterns) and Chart.js documentation patterns. Confidence levels reflect source reliability.

---

## Table Stakes

Features users (and demo stakeholders) expect. Missing = dashboard feels unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Currency formatting with locale | Numbers without $ / commas look like mockups, not products | Low | Use `Intl.NumberFormat` with `style: 'currency'` |
| Relative date labels on chart x-axis | "Mon", "Tue" beats epoch timestamps — instant comprehension | Low | Chart.js `type: 'time'` or manual label array |
| Clear today/now marker on forecast chart | Users need to know where history ends and prediction begins | Low | Vertical annotation line or color break at today |
| Loading/empty state for every data zone | Blank panels feel broken; skeleton cards signal "data is coming" | Low | Fluent UI Skeleton component |
| Color-coded severity for insights | Critical / warning / info visual hierarchy — not just ranked text | Low | Red / amber / blue badge or left-border accent |
| Positive/negative number coloring | Green for positive cash flow, red for negative — universal fintech convention | Low | CSS token variables, not inline style |
| Card-based layout with visible elevation | Flat grids feel like spreadsheets; cards signal interactive, distinct content zones | Low | Fluent UI Card with shadow token |
| Accessible contrast on dark theme | `webDarkTheme` needs care: ensure text-on-background passes WCAG AA | Medium | Use Fluent design tokens, avoid custom hex colors |
| Dismiss/undo pattern on recommendations | Dismissing without undo feels punitive; brief toast "Dismissed — Undo" adds trust | Low | Optional but strongly recommended for demo credibility |
| Consistent iconography | Every insight / action has an icon — icon-free lists feel incomplete | Low | Fluent UI icons package already installed |

---

## Differentiators

Features that make the demo compelling beyond "it works."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Confidence band shading on forecast | Communicates that AI knows what it doesn't know — the single most powerful trust signal for predictive UI | Medium | Chart.js dataset with `fill: '+1'` between upper/lower bound datasets |
| "Why this?" expandable reasoning per insight | Explainability is the difference between AI that feels magic vs. AI that feels trustworthy | Medium | Fluent Accordion or inline expand toggle |
| Delta indicator on simulator | When user moves a slider, show "+$240 in 7 days" delta badge next to the chart — makes causality visceral | Medium | Derived from `applySimulation` output diff |
| Scenario named presets | "What if I delay all payments?" one-click preset — lowers friction for stakeholders exploring the demo | Low | Three preset buttons that set SimulationState |
| Priority badge gradient in supplier list | Urgent → High → Normal → Low with color + label — stakeholders see triage at a glance | Low | Fluent Badge with status colors |
| Non-intrusive financing card | Financing prompt that appears contextually (when shortfall detected) rather than always visible — models respectful AI nudge | Low | Conditional render based on forecast going negative |
| Shortfall warning MessageBar | Specific date + amount: "Projected shortfall of $1,240 on Apr 18" beats generic warnings | Low | Derived from forecast data in Dashboard |

---

## Anti-Features

Features to explicitly NOT build for this prototype.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Animated number counters (count-up effect) | Adds 300ms of perceived latency; stakeholders waiting for a number to "roll" to its final value lose thread | Static render with good typography |
| Pie/donut charts for expense breakdown | Pie charts are weak for comparison; common fintech antipattern that looks decorative | Bar chart or ranked list if breakdown is needed |
| Tooltip-only data (no table fallback) | Hover-only information fails on mobile and in screen recordings / demo walkthroughs | Always show key numbers in text, use tooltip for supplemental detail |
| Infinite scroll for insights | Insights panel should show all 4 pre-authored insights; pagination adds friction with no benefit | Simple vertical card list |
| Auto-refresh / polling animation | Fake "live" spinners signal deception in a static prototype — stakeholders notice | Static data with clear "last updated" timestamp mock |
| Full loan application form | Deep form in a prototype derails the demo narrative | CTA button that shows a toast "Full application flow coming soon" |
| Percentage-only figures | "23% higher" without the underlying number is frustrating for financially literate stakeholders | Always show absolute value + percentage |

---

## Feature Deep Dives

### 1. Cash Flow Forecast Chart (Line + Confidence Bands)

**What users expect:**
- History line in neutral/white; forecast line in brand color (e.g., Fluent blue)
- Confidence band as a translucent fill between upper and lower bound lines
- Vertical "today" divider — dashed vertical line or background color change
- Zero baseline reference line (dashed, subtle) — critical for cash flow; going below zero is the entire point
- X-axis: short date labels ("Apr 8", "Apr 9") — not timestamps
- Y-axis: currency formatted, abbreviated ($1.2K not $1,200 if space is tight)
- Danger zone shading: area below zero can have a subtle red fill background — high visual impact

**Chart.js implementation pattern (HIGH confidence — stable API):**

```typescript
// Three datasets: actual, forecastUpper, forecastLower
// forecastUpper fills down to forecastLower using fill: '+1'
datasets: [
  {
    label: 'Balance',
    data: historicalPoints,
    borderColor: tokens.colorNeutralForeground1,
    tension: 0.3,
    fill: false,
  },
  {
    label: 'Forecast',
    data: forecastMidpoints,
    borderColor: tokens.colorBrandForeground1,
    borderDash: [5, 3],
    tension: 0.3,
    fill: false,
  },
  {
    label: 'Upper bound',
    data: upperBound,
    borderColor: 'transparent',
    fill: '+1',  // fills to next dataset (lowerBound)
    backgroundColor: 'rgba(0, 120, 212, 0.12)',
  },
  {
    label: 'Lower bound',
    data: lowerBound,
    borderColor: 'transparent',
    fill: false,
  },
]
```

**Critical:** Register `Filler` plugin from Chart.js — `fill` between datasets requires it. Without registration, `fill: '+1'` silently does nothing.

```typescript
import { Chart, Filler } from 'chart.js';
Chart.register(Filler);
```

**Confidence indicator pattern:** Width of the band naturally widens over time — narrow near today, wide at day 14. This is the correct visualization of growing uncertainty and requires no extra explanation to stakeholders.

---

### 2. AI Insights Panel (Ranked Recommendations)

**Trust signals that matter (HIGH confidence — well-established XAI pattern):**

1. **Severity badge** — Visual priority before the user reads a word. Use color + label: Critical (red), Warning (amber), Info (blue). Never priority number alone ("Priority 1" is opaque).

2. **Action headline, not process description** — "Delay Sunshine Bakery payment by 5 days" not "Payment timing optimization detected." The insight should answer "what should I do?" immediately.

3. **"Why this?" expand** — Collapsed by default to keep the list scannable. Expanded content should include: the data signal ("Your balance dips below $0 on Apr 18"), the causal chain ("Paying $3,200 to Metro Produce on Apr 14 contributes 62% of the shortfall"), and the projected outcome if acted ("Delaying 5 days improves Apr 18 balance to +$420"). This three-part structure — signal, cause, outcome — is the minimum for explainable AI credibility.

4. **Approve / Dismiss actions** — Approve implies the user will act; Dismiss means "not now." Both should be present and visually equal-weight (avoid making Dismiss a ghost/minor button — this signals the system is pushing Approve). In the prototype, Approve triggers the simulation state update; Dismiss removes the card.

5. **Ranked order with visible rationale** — "Most urgent first" label or sort indicator. Stakeholders want to know the list is ordered, not arbitrary.

6. **Never auto-dismiss** — Insights should persist until the user acts. Auto-disappearing AI recommendations are deeply mistrusted.

**Fluent UI implementation note:** Use `Accordion` for the "Why this?" expand, or a manual `useState(expanded)` toggle with `motion.div` for smooth height animation. The Fluent `Accordion` approach is simpler and accessible.

---

### 3. Scenario Simulator (What-If Controls + Reactive Chart)

**UX conventions (MEDIUM confidence — drawn from financial planning tool patterns):**

**Real-time feedback is mandatory.** The moment a user moves a slider, the chart must update. Any debounce > 150ms breaks the sense of direct manipulation. For static mock data with a pure function, debounce is unnecessary — compute synchronously.

**Delta indicator is the killer feature.** After simulation runs, show a diff badge near the chart title or in a summary strip:

```
Without changes:  Shortfall of $1,240 on Apr 18
With your changes: Surplus of $420 on Apr 18  ✓
```

This delta strip is what makes the "so what?" of the simulation immediately legible to stakeholders.

**Control labeling pattern:**
- Slider label should show current value inline: "Delay Metro Produce payment: 5 days"
- Slider should show min/max context: "0 days — 14 days"
- Toggle label should describe the active state, not the action: "Payment delayed" (on) vs "Pay on schedule" (off)

**Preset scenarios** — three named presets reduce exploration friction:
- "Delay all payments" (max delay on all suppliers)
- "Take minimum loan" (loan slider at floor)
- "Worst case" (all payments on time, no loan)

Presets are low implementation cost and high demo value.

**Reset button** — always visible, always enabled. Stakeholders testing the simulator need confidence they can return to baseline. Position near the chart, not buried in the controls.

---

### 4. Supplier Payment Optimizer (Table + Priority Badges)

**Table stakes for credibility (HIGH confidence):**

- Supplier name + amount + due date are the minimum columns — stakeholders will look for these immediately
- Priority badge must be color + text, not color alone (accessibility + comprehension)
- AI recommendation text per row should be short: "Delay 5 days — saves $420 in shortfall risk" not a paragraph
- "Recommended action" column should be distinct from "due date" column — don't conflate scheduling with AI advice
- Sortable by due date — stakeholders will want to find what's due soonest
- Row highlighting for urgent items (red left-border or subtle red background) — scannable at a glance

**Priority badge colors aligned with Fluent UI semantic tokens:**
- Urgent: `colorPaletteRedBackground3` / `colorPaletteRedForeground1`
- High: `colorPaletteMarigoldBackground3` / `colorPaletteMarigoldForeground1`
- Normal: `colorNeutralBackground3` / `colorNeutralForeground1`
- Low: `colorPaletteTealBackground3` / `colorPaletteTealForeground1`

**Do not use a full data grid** — Fluent DataGrid is over-engineered for 6 rows. A styled `<table>` with Fluent tokens or a `Card`-list approach is faster to build and equally credible for a prototype.

---

### 5. Contextual Financing Card

**Non-intrusive means conditional, not hidden (HIGH confidence — pattern from Revolut, Wise, Mercury):**

The card should only render when the forecast detects a projected shortfall. This is the entire design rationale — the AI is watching and surfaces help only when relevant.

**Card anatomy:**
1. Heading: specific loan offer tied to the shortfall — "Cover your Apr 18 shortfall with a $2,000 credit line"
2. Key terms at a glance: rate, repayment term — two numbers max
3. Single CTA: "See loan options" or "Apply now" — leads to toast in prototype
4. Dismissible — small X in corner; dismissed state stored in AppContext

**What NOT to do:**
- Don't show the card when balance is healthy — contextual = conditional
- Don't use a modal — modals for financing prompts feel aggressive
- Don't list multiple loan products — one clear recommendation, not a product catalog
- Don't show an APR without also showing a monthly repayment estimate — APR alone is opaque to small business owners

**Positioning:** Below the shortfall warning MessageBar, above the insights panel. The narrative reads: "Here's the problem [MessageBar] → here's how to solve it [FinanceCard] → here's what else to do [InsightPanel]."

---

### 6. Responsive Layout

**Mobile-first fintech conventions (HIGH confidence — industry standard since 2019):**

**Mobile (< 640px):**
- Single column, full-width cards
- Chart height: 200–240px — taller charts on mobile require too much scrolling to see the rest of the page
- Bottom tab navigation (3 tabs: Dashboard, Simulate, Payments) — thumb-reachable
- Insight cards full-width with tap targets ≥ 44px for approve/dismiss buttons
- Supplier table: consider card-list instead of horizontal table — horizontal scroll on mobile is a major UX failure for financial data

**Tablet (640–1024px):**
- Two-column grid: chart full-width top, then two-column for insights + financing card
- Side navigation or top nav (bottom tabs feel awkward on tablet)

**Desktop (> 1024px):**
- Three-column: main content (chart + simulator) takes 2/3, sidebar (insights + financing) takes 1/3
- Top navigation bar
- Chart height: 300–360px — more data visible without scrolling

**CSS Modules approach for breakpoints:**
```css
/* Dashboard.module.css */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacingVerticalL);
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 2fr 1fr;
  }
}
```

This is mobile-first (default = single column, widen up) which aligns with the PROJECT.md requirement.

---

## Feature Dependencies

```
Cash flow forecast data
  → CashFlowChart (reads forecastPoints)
  → ShortfallWarning MessageBar (reads forecast.minBalance < 0)
  → FinanceCard conditional render (reads forecast.shortfallDate)

SimulationState (AppContext)
  → applySimulation(forecast, simulation) → simulatedForecast
  → CashFlowChart in Simulate screen (reads simulatedForecast)
  → Delta indicator (diff between base forecast and simulatedForecast)

InsightCard actions
  → APPROVE_INSIGHT reducer action → updates simulation state (approved insight implies scenario applied)
  → DISMISS_INSIGHT reducer action → removes card from list

Supplier data
  → SupplierList table
  → Simulation controls (delay payment toggles reference supplier IDs)
```

---

## MVP Recommendation

**For demo credibility, prioritize in this order:**

1. Cash flow chart with confidence bands + today marker (this IS the visual centerpiece — stakeholders assess the product in the first 10 seconds based on this chart)
2. AI Insights with "Why this?" expandable reasoning (explainability is the narrative core)
3. Approve/Dismiss with AppContext state (shows interactivity — static prototype that doesn't respond to interaction fails the demo)
4. Supplier list with priority badges (table stakes — expected in any cash management tool)
5. Scenario simulator with delta indicator (the "wow" moment of the demo)
6. Financing card — conditional on shortfall (completes the narrative arc)
7. Responsive layout (mobile credibility for banking context)

**Defer:**
- Undo toast for Dismiss: nice but not critical for prototype
- Scenario presets: easy to add if demo time allows
- Animated delta transitions: not worth the added complexity

---

## Sources

All findings are from training knowledge of established fintech dashboard patterns (Mercury, Brex, Revolut, Wise, Xero, QuickBooks interfaces), Chart.js documentation patterns (stable since v3), and established XAI/explainable AI UX research (DARPA XAI program outputs, Nielsen Norman Group AI trust research). No live web sources were accessible in this session (WebSearch and Brave Search unavailable).

| Area | Confidence | Basis |
|------|------------|-------|
| Chart.js `fill: '+1'` confidence bands | HIGH | Stable Chart.js v3/v4 API, well-documented |
| Filler plugin registration requirement | HIGH | Known breaking omission in Chart.js v3+ |
| "Why this?" three-part XAI pattern | HIGH | Established in XAI research: signal + cause + outcome |
| Fintech color conventions (red/green) | HIGH | Universal — no source needed |
| Delta indicator on simulator | MEDIUM | Strong pattern in financial planning tools; not formally documented |
| Mobile bottom tab navigation | HIGH | iOS/Android HIG standard, adopted universally in fintech |
| 44px minimum touch target | HIGH | Apple HIG / WCAG 2.5.5 criterion |
| Conditional financing card positioning | MEDIUM | Inferred from Revolut/Wise contextual upsell patterns |
