# AGENTS.md — instructions for AI agents working on this repo

## Purpose

This is a **prototype** that checks room availability for 5 fictional rooms on a fictional campus. The current time is fixed at **09:00** (`NOW_MIN = 540`). The app **never creates bookings** — it only reports whether a requested time slot is available for a selected room.

This is **not a production app**: there is no login, no database, no API, and no payments. All data is hard-coded in `src/data/rooms.ts`.

## Architecture

| Layer | Path | Responsibility |
|-------|------|----------------|
| Data | `src/data/` | Room catalog and constants (`ROOMS`, `NOW_MIN`, `EQUIPMENT`, types). Frozen, immutable. |
| Domain | `src/domain/` | Pure business rules as pure functions. **No React, no side effects, no I/O.** `availability.ts`, `filters.ts`, `time.ts`. |
| Components | `src/components/` | Presentation only. Receive data through props, call back via handlers. No business logic. |
| Wiring | `src/App.tsx` | Holds UI state and wires components to domain functions. |
| Tests | `tests/` | Vitest + Testing Library, jsdom environment. Domain tests + UI tests. |

Data flows one way: `data → domain → App → components`. Components never call domain functions directly; `App` does.

## Setup and safe commands

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm test           # run the Vitest suite
npm run lint       # run ESLint
npm run typecheck  # run tsc --noEmit
npm run build      # production build
npm audit          # read-only dependency audit (do not run npm audit fix without approval)
```

`npm audit` is read-only and safe. `npm audit fix` is **not** safe — see Forbidden actions.

## Coding conventions

- **TypeScript strict** is on (`tsconfig.app.json`); do not weaken it.
- Business rules live **only** in `src/domain/` as pure functions. Keep them free of React and side effects.
- Components are presentational: they get data through props and report up through callbacks. No business logic in components.
- Import project modules with the `@/` alias (`@/domain/time`, `@/components/ResultCard`), not deep relative paths.
- Keep room data **frozen and immutable** (`Object.freeze` in `src/data/rooms.ts`). Never mutate `ROOMS` or a room's `bookings`.
- Match the existing style: functional components, hooks, Tailwind classes, lucide-react icons.

## Acceptance criteria — must stay true after every change

These are the contract of the app. Every change must preserve them.

- **AC1 — Time rules.** The start time must be strictly after the current time (09:00). `00:00` entered in the End field means `24:00` (1440 minutes). The maximum duration is 120 minutes: exactly 120 is allowed, 121 is not.
- **AC2 — Overlap.** A slot that overlaps an existing booking of the selected room is Unavailable. Touching endpoints do **not** overlap: a slot may start exactly when a booking ends, or end exactly when a booking starts.
- **AC3 — Blocked room.** A blocked room is never Available, regardless of the time slot.
- **AC4 — Filtering.** Only rooms with `capacity >= attendees` AND all selected equipment are listed. When no room matches, a clear empty state is shown.
- **AC5 — Room switching.** Switching the selected room re-checks the same time slot against that room's own bookings. Room data is never modified by checking.

## Test expectations

Before saying a task is done, run all four gates and show the **real totals**:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

- Every behavior change needs a test that covers it.
- **Never delete or weaken a test to make it pass.** If a test must change, say which test, why, and what the new assertion checks.
- The baseline is all tests must pass (see npm test).

## Allowed files

You may edit freely inside:

- `src/`
- `tests/`
- `README.md`
- `AGENTS.md`

Everything else (config files, `package.json`, `package-lock.json`, `.bolt/`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`) requires **explicit approval** first.

## Forbidden actions

- No secrets, API keys, or `.env` files.
- No deploy or publish of any kind.
- No destructive commands: `rm -rf`, deleting files or tests, `git push --force`, `git reset --hard`.
- No adding, removing, or upgrading dependencies (including `npm audit fix`, `npm install <pkg>`, or version bumps) without explicit approval and a shown diff of `package.json` and `package-lock.json`.
- Do not edit `.bolt/` or config files without approval.

## Review gate

At the end of every task, report:

1. The list of changed files.
2. A short diff summary per file.
3. The real output of `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` (totals, not just "passed").
4. Any risks or follow-ups you see.

I review and approve before the next step begins.
