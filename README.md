# Smart Campus Room Availability Checker

A prototype web app that checks whether a requested time slot is available for one of 5 fictional campus rooms. The current time is fixed at 09:00. The app reports availability only — it **does not create bookings**. There is no login, no database, and no API; all room data is hard-coded.

Built with React, TypeScript, Vite, and Tailwind CSS. Tested with Vitest and Testing Library.

> Agent instructions (coding conventions, acceptance criteria, review gate) live in [AGENTS.md](./AGENTS.md).

## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
npm install
```

## Commands

```bash
npm run dev        # start the dev server
npm test           # run the test suite (Vitest)
npm run lint       # run ESLint
npm run typecheck  # run tsc --noEmit
npm run build      # production build
npm audit          # read-only dependency audit
```

## Project structure

```
src/
  data/            # room catalog + constants (frozen, immutable)
  domain/          # pure business rules (no React, no side effects)
  components/      # presentational React components
  App.tsx          # UI state and wiring
  main.tsx         # entry point
tests/             # Vitest + Testing Library (jsdom)
AGENTS.md          # instructions for AI agents
```

## The 5 fictional rooms

| ID | Name | Capacity | Equipment | Blocked |
|----|------|----------|-----------|---------|
| R204 | Room 204 | 30 | projector, whiteboard | no |
| H101 | Lecture Hall 101 | 120 | projector, microphone, video conference | no |
| L310 | Computer Lab 310 | 24 | computers, projector, whiteboard | no |
| S12 | Study Room 12 | 6 | whiteboard | no |
| M405 | Meeting Room 405 | 10 | video conference, whiteboard | **yes** |

Each room has a fixed set of existing bookings. A blocked room (M405) is never available.
