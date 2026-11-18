# Project memory

## Product intent & audience

- Room availability/booking prototype for an internal workspace (room numbers like "204", time-slot grid).
- Clearly a prototype: footer explicitly states it "checks availability only, does not create bookings."
- Audience: internal users reviewing room availability across the day.

## Brand personality & voice

- Functional, straightforward, no marketing tone.
- UI copy is literal: "Current time:", "Available"/"Unavailable", "Existing Bookings", "No existing bookings", "Booking Rules".

## Visual design & UX direction

- Tailwind CSS + JSX; lucide-react for icons; `@/` path alias for `src/`.
- Slate palette as the neutral base; accessibility matters (WCAG AA contrast targeted — moved slate-400 text to slate-500 where it carried readable text).
- Decorative bullets (`•`) may keep lighter shades since they carry no text/digits.
- Components seen: `App`, `RoomDetails`, `Timeline`, `RulesList`; time labels rendered in Timeline; footer in App.
- Layout shows current time header, room cards/timeline, rules list, and footer.

## Decisions, constraints & rationale

- Governance file `AGENTS.md` exists and governs work: change only named files, no dependency/config changes, never weaken tests, run all four gates (`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`), finish with a review gate.
- `AGENTS.md` baseline test count is intentionally non-fixed: "all tests must pass (see npm test)" (was a hardcoded number like "59 tests ... 5 files").
- Test-first workflow: write the failing/passing test before applying each mitigation.
- Current time is driven by a `NOW_MIN` constant (minutes from midnight); production-correct at 540 (09:00). Tests must protect current-time behavior using literal times, not by importing `NOW_MIN` (so a silent change to `NOW_MIN` still fails tests).
- Mitigation tests live in `tests/mitigations.test.tsx`, separate from existing suites.
- Color/contrast fix scope: only `text-slate-400` used for readable text elements (App footer, RoomDetails "Existing Bookings"/"No existing bookings", Timeline time labels, RulesList "Booking Rules" heading) changed to `text-slate-500`. Decorative `•` bullet left as `text-slate-400`.
- No visual/browser verification done; verified via class comparison + tests.
- Known, accepted risk: `npm audit` reports dev-dependency vulnerabilities; dependencies intentionally untouched.

## Open questions & assumptions

- Contrast test guards only the `text-slate-400` class specifically; other low-contrast classes (e.g. slate-300) would not be caught — general a11y audit not implemented.
- Assumption: single Tailwind shade step (slate-400 → slate-500) is imperceptible to users while meeting AA — not visually/screenshot verified.
- Whether a general accessibility/contrast lint should be added later is unresolved.