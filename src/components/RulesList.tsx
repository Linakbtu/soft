import { MAX_DURATION } from '@/domain/availability';
import { NOW_MIN } from '@/data/rooms';
import { toHHMM } from '@/domain/time';

const rules: string[] = [
  `Start must be strictly after the current time (${toHHMM(NOW_MIN)}).`,
  `Maximum duration is ${MAX_DURATION} minutes (exactly ${MAX_DURATION} is allowed).`,
  'If the room is blocked, all requests are unavailable.',
  'Touching endpoints do not overlap (a slot may start exactly when a booking ends).',
  'Rooms are shown only if they have enough seats and ALL selected equipment.',
];

export function RulesList() {
  return (
    <section className="bg-white/60 rounded-2xl border border-slate-200 p-4 sm:p-5">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        Booking Rules
      </h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
