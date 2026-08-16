# Scholarship Dashboard — Student Dashboard

**Live demo:** https://krishna-shri.github.io/student_dashboard/

A one-page student dashboard that helps a college student manage an active scholarship application cycle. The central thesis is **leverage**: one essay answer can unblock multiple applications at once, and the dashboard makes that multiplier visible and actionable.

---

## What the project does

The student (Maya) has 11 scholarship applications open, each with a mix of essay answers, document uploads, and third-party requirements (recommendation letters, FAFSA confirmation). The dashboard:

- Ranks the top 3 tasks the student can finish right now and explains why each is ranked where it is
- Shows which applications each essay feeds — "this answer also satisfies Hollings Family, Gates Millennium, and Coca-Cola Community" — before writing begins
- Surfaces a Submit button the moment an application is fully ready, records the submission, and updates a running dollar total
- Allows nudging recommendation letter owners, uploading documents with a simulated upload flow, and entering a GPA via a select
- Reranks tasks and applications live after every action
- Supports dark and light mode

---

## Features

| Feature | Description |
|---|---|
| Ranked task list | Top 3 tasks sorted by urgency, leverage, or proximity to submission. Sort reason visible. |
| Leverage panel | Expand any essay task to see which applications it feeds with deadlines and amounts. |
| Suggest with AI | Each essay textarea has a Suggest button that fills a realistic draft after a 2-second thinking animation. |
| Submit button | Appears inline on any "Ready to submit" row. Records submission with receipt and running dollar total. |
| Document upload | Upload button with 2-second simulation and success confirmation. |
| Reminder nudge | Nudge third-party owners with a bell toast notification. |
| Filter chips | Filter applications by Needs you / Waiting on others / Ready to submit / Closed. |
| Dark / light mode | Full OKLCH color token system; light mode default. |
| Inline artifact editor | "Answer here" inside expanded applications uses isolated local state — does not affect the top task panel until saved. |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 (OKLCH tokens, CSS variables, `.dark` class) |
| UI primitives | Radix UI (Checkbox, accessible components) |
| Icons | Lucide React |
| Variants | class-variance-authority + clsx + tailwind-merge |
| Formatter | Prettier + prettier-plugin-tailwindcss |
| State | React `useReducer` — no external state library |
| Persistence | None — all state in memory, resets on refresh |

---

## Installation

**Prerequisites:** Node.js 18+

```bash
# Navigate to the project folder
cd student-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview

# Format all source files
npm run format

# Lint
npm run lint
```

---

## Project structure

```
src/
  main.tsx                       — entry point
  App.tsx                        — root layout, dark/light toggle, nudge toast
  types.ts                       — all TypeScript types
  seed.ts                        — initial state and sample data
  reducer.ts                     — all state transitions (pure functions)
  selectors.ts                   — derived state: ranked tasks, standings, filters
  index.css                      — Tailwind import, OKLCH CSS tokens, animations
  lib/
    utils.ts                     — mergeClasses() helper (clsx + tailwind-merge)
  components/
    StatusStrip.tsx               — where-you-stand summary and segmented bar
    SegmentedBar.tsx              — proportional progress bar used by StatusStrip
    NextUpSection.tsx             — ranked task list with save/submit receipts
    TaskRow.tsx                   — individual task: Suggest button, leverage panel, essay editor
    LeveragePanel.tsx             — "this answer also satisfies" with app names, amounts, deadlines
    FilterChips.tsx               — filter tabs: Needs you / Waiting / Ready / Closed
    ApplicationList.tsx           — filtered and ranked application list
    ApplicationRow.tsx            — application card: expand, submit button, inline artifact editor
    RequirementRow.tsx            — single requirement row: essay, checkbox, upload, or nudge
    ui/
      button.tsx                  — CVA-based Button with variants
      badge.tsx                   — CVA-based Badge with status variants
      checkbox.tsx                — Radix UI Checkbox with custom styling
      textarea.tsx                — styled Textarea
```
