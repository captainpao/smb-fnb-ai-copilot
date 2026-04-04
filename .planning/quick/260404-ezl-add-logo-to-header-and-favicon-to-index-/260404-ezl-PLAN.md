---
phase: quick
plan: 260404-ezl
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/NavBar/NavBar.tsx
  - src/components/NavBar/NavBar.module.css
  - index.html
autonomous: true
requirements: []
must_haves:
  truths:
    - "Logo image appears to the left of the 'SMB Cashflow Copilot' brand text in the header"
    - "Browser tab shows the favicon.ico instead of the Vite default"
  artifacts:
    - path: "src/components/NavBar/NavBar.tsx"
      provides: "Logo img tag inside .brand div, left of text"
    - path: "src/components/NavBar/NavBar.module.css"
      provides: "Logo image sizing style (.brandLogo)"
    - path: "index.html"
      provides: "favicon link pointing to /favicon.ico"
  key_links:
    - from: "src/components/NavBar/NavBar.tsx"
      to: "src/assets/logo.png"
      via: "import logoUrl from '../../assets/logo.png'"
---

<objective>
Add the project logo to the NavBar header left of the brand text, and replace the default Vite favicon with favicon.ico.

Purpose: Establishes branded identity in both the app header and browser tab.
Output: Updated NavBar.tsx, NavBar.module.css, and index.html.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add logo to NavBar and update favicon in index.html</name>
  <files>src/components/NavBar/NavBar.tsx, src/components/NavBar/NavBar.module.css, index.html</files>
  <action>
    **NavBar.tsx** — import the logo asset and render it inside the `.brand` div:

    1. Add import at the top: `import logoUrl from '../../assets/logo.png'`
    2. Replace the existing `.brand` div:
       ```tsx
       <div className={styles.brand}>
         <img src={logoUrl} alt="SMB Co-Pilot logo" className={styles.brandLogo} />
         SMB Cashflow Copilot
       </div>
       ```

    **NavBar.module.css** — add sizing for the logo image inside `.brand`:

    1. Update `.brand` to use flex layout so image and text sit side-by-side:
       ```css
       .brand {
         display: flex;
         align-items: center;
         gap: 8px;
         font-size: 16px;
         font-weight: 700;
         color: #020b43;
         white-space: nowrap;
         letter-spacing: -0.3px;
       }
       ```
    2. Add new rule:
       ```css
       .brandLogo {
         height: 28px;
         width: auto;
         display: block;
       }
       ```

    **index.html** — replace the Vite default icon link:

    Replace:
    ```html
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    ```
    With:
    ```html
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ```

    Note: favicon.ico is at the project root, which Vite serves as `/favicon.ico` in dev and copies to `dist/` on build. No Vite config change needed.
  </action>
  <verify>
    <automated>cd /Users/kokwaileong/Documents/Works/IBM/smb-fnb-ai-copilot && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>
    - Build completes without errors
    - NavBar.tsx imports logo.png and renders img + text inside .brand
    - NavBar.module.css has .brandLogo height rule and .brand uses flex
    - index.html link rel="icon" points to /favicon.ico
  </done>
</task>

</tasks>

<verification>
Run `npm run build` — must exit 0 with no TypeScript or module-resolution errors.
Visually confirm in dev server (`npm run dev`): logo appears left of brand text in header; browser tab shows favicon.ico.
</verification>

<success_criteria>
- `npm run build` exits 0
- Logo image renders at 28px height left of "SMB Cashflow Copilot" text
- Browser tab favicon is favicon.ico (not vite.svg)
</success_criteria>

<output>
After completion, create `.planning/quick/260404-ezl-add-logo-to-header-and-favicon-to-index-/260404-ezl-SUMMARY.md`
</output>
