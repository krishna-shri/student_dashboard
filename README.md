# Scholarship Dashboard — Student Dashboard

**Live demo:** https://krishna-shri.github.io/student_dashboard/

A one-page student dashboard that helps a college student manage an active scholarship application cycle. The central thesis is **leverage**: one essay answer can unblock multiple applications at once, and the dashboard makes that multiplier visible and actionable.

---

## What the project does

The student (Maya) has 11 scholarship applications open, each with a mix of essay answers, document uploads, and third-party requirements (recommendation letters, FAFSA confirmation). The dashboard:

- Ranks the top 3 tasks she can finish right now and explains why each is ranked where it is
- Shows which applications each essay feeds — "this answer also satisfies Hollings Family, Gates Millennium, and Coca-Cola Community" — before she starts writing
- Surfaces a Submit button the moment an application is fully ready, records the submission, and updates a running dollar total
- Lets her nudge recommendation letter owners, upload documents with a simulated upload flow, and enter her GPA via a select
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
  App.tsx            — root layout, dark/light toggle, nudge toast
  types.ts           — all TypeScript types
  seed.ts            — initial state and sample data
  reducer.ts         — all state transitions (pure functions)
  selectors.ts       — derived state: ranked tasks, standings, filters
  lib/
    utils.ts         — cn() helper
  components/
    ui/              — shadcn-style primitives: Button, Badge, Checkbox, Textarea
    StatusStrip      — where-you-stand summary and segmented bar
    NextUpSection    — ranked task list with receipts
    TaskRow          — individual task with Suggest button and leverage panel
    LeveragePanel    — "this answer also satisfies" disclosure
    ApplicationRow   — application card with expand, submit, and inline editor
    RequirementRow   — individual requirement (essay, checkbox, upload, nudge)
    FilterChips      — status filter tabs
    ApplicationList  — filtered and ranked application list
    SegmentedBar     — proportional progress bar
```
