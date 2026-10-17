import { useState, useMemo } from 'react';
import { Clock, MapPin, Check, X, AlertTriangle, Lock, CalendarDays, DoorOpen } from 'lucide-react';

// ── Fixed fictional data ──────────────────────────────────────
const ROOM_NAME = 'Room 204';
const NOW_MIN = 540; // 09:00
const BOOKINGS: { start: number; end: number; label: string }[] = [
  { start: 600, end: 660, label: '10:00–11:00' }, // 10:00–11:00
];
const MAX_DURATION = 120;

// ── Helpers ───────────────────────────────────────────────────
function toMinutes(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

type Result =
  | { kind: 'available' }
  | { kind: 'unavailable'; reason: string };

function checkAvailability(
  startMin: number,
  endMin: number,
  blocked: boolean
): Result {
  if (blocked) {
    return { kind: 'unavailable', reason: 'Room is blocked by administration.' };
  }
  if (startMin <= NOW_MIN) {
    return {
      kind: 'unavailable',
      reason: `Start time must be strictly after the current time (${toHHMM(NOW_MIN)}).`,
    };
  }
  if (endMin - startMin > MAX_DURATION) {
    return {
      kind: 'unavailable',
      reason: `Duration exceeds the ${MAX_DURATION}-minute maximum (you requested ${endMin - startMin} min).`,
    };
  }
  for (const b of BOOKINGS) {
    // touching endpoints do NOT overlap
    if (startMin < b.end && endMin > b.start) {
      return {
        kind: 'unavailable',
        reason: `Overlaps with existing booking ${b.label}.`,
      };
    }
  }
  return { kind: 'available' };
}

// ── Component ─────────────────────────────────────────────────
function App() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const timeline = useMemo(() => {
    // build a visual timeline from 08:00 to 18:00
    const start = 8 * 60;
    const end = 18 * 60;
    const total = end - start;
    const segments: { left: number; width: number; type: 'free' | 'booked' | 'now' }[] = [];

    // merge booked + now into segments
    let cursor = start;
    const markers: { min: number; type: 'booked' | 'now' }[] = [
      ...BOOKINGS.map((b) => ({ min: b.start, type: 'booked' as const })),
      ...BOOKINGS.map((b) => ({ min: b.end, type: 'booked' as const })),
      { min: NOW_MIN, type: 'now' as const },
    ].sort((a, b) => a.min - b.min);

    const points = Array.from(new Set(markers.map((m) => m.min))).filter(
      (m) => m >= start && m <= end
    );

    for (const p of points) {
      if (p > cursor) {
        segments.push({ left: ((cursor - start) / total) * 100, width: ((p - cursor) / total) * 100, type: 'free' });
      }
      cursor = p;
    }
    if (cursor < end) {
      segments.push({ left: ((cursor - start) / total) * 100, width: ((end - cursor) / total) * 100, type: 'free' });
    }

    // overlay booked + now as separate layers
    const bookedSegs = BOOKINGS.filter((b) => b.end > start && b.start < end).map((b) => ({
      left: ((Math.max(b.start, start) - start) / total) * 100,
      width: ((Math.min(b.end, end) - Math.max(b.start, start)) / total) * 100,
    }));

    const nowPct = ((NOW_MIN - start) / total) * 100;

    return { start, end, total, bookedSegs, nowPct };
  }, []);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    setResult(null);

    // validation
    if (!startTime || !endTime) {
      setError('Please fill in both start and end times.');
      return;
    }

    const startMin = toMinutes(startTime);
    let endMin = toMinutes(endTime);

    if (startMin === null || endMin === null) {
      setError('Times must be in HH:MM format (e.g. 09:30).');
      return;
    }

    // Treat 00:00 in the End field as 24:00 (1440), since end = 0 can never be valid.
    if (endMin === 0) endMin = 1440;

    if (endMin <= startMin) {
      setError('End time must be after start time.');
      return;
    }

    if (startMin < 0 || endMin > 1440) {
      setError('Times must be between 00:00 and 24:00.');
      return;
    }

    const res = checkAvailability(startMin, endMin, blocked);
    setResult(res);
  }

  function handleReset() {
    setStartTime('');
    setEndTime('');
    setBlocked(false);
    setSubmitted(false);
    setError(null);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <DoorOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs text-slate-500">Check room availability — no booking required</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Room info card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{ROOM_NAME}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Current time: <span className="font-semibold text-slate-700">{toHHMM(NOW_MIN)}</span>
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <span className="text-sm font-medium text-slate-700">Room blocked</span>
              <button
                type="button"
                role="switch"
                aria-checked={blocked}
                onClick={() => {
                  setBlocked((b) => !b);
                  setResult(null);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  blocked ? 'bg-red-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    blocked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Existing bookings */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Existing Bookings
            </p>
            <div className="flex flex-wrap gap-2">
              {BOOKINGS.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>08:00</span>
              <span>13:00</span>
              <span>18:00</span>
            </div>
            <div className="relative h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
              {/* booked segments */}
              {timeline.bookedSegs.map((seg, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 bg-amber-300/80 border-x border-amber-400 flex items-center justify-center"
                  style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                >
                  <span className="text-[9px] font-bold text-amber-800 truncate px-1">Booked</span>
                </div>
              ))}
              {/* now marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
                style={{ left: `${timeline.nowPct}%` }}
              >
                <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-300 border border-amber-400" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Now
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300" /> Free
              </span>
            </div>
          </div>
        </section>

        {/* Check form */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Check Availability</h3>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="start" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Start time
                </label>
                <input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="09:30"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  End time
                </label>
                <input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="10:30"
                />
              </div>
            </div>

            {submitted && error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
              >
                Check
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* Result */}
        {submitted && result && !error && (
          <section
            className={`rounded-2xl border-2 shadow-sm p-5 sm:p-6 transition-all animate-in ${
              result.kind === 'available'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.kind === 'available' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {result.kind === 'available' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <X className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-bold ${
                    result.kind === 'available' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.kind === 'available' ? 'Available' : 'Unavailable'}
                </h3>
                {result.kind === 'unavailable' && (
                  <p className="text-sm text-red-600 mt-0.5">{result.reason}</p>
                )}
                {result.kind === 'available' && (
                  <p className="text-sm text-green-600 mt-0.5">
                    Room 204 is available for your requested time slot.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Rules reference */}
        <section className="bg-white/60 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
            Booking Rules
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-slate-400 shrink-0">•</span>
              Start must be strictly after the current time ({toHHMM(NOW_MIN)}).
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400 shrink-0">•</span>
              Maximum duration is {MAX_DURATION} minutes (exactly {MAX_DURATION} is allowed).
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400 shrink-0">•</span>
              If the room is blocked, all requests are unavailable.
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400 shrink-0">•</span>
              Touching endpoints don't overlap (11:00–12:00 is fine after a 10:00–11:00 booking).
            </li>
          </ul>
        </section>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        Prototype — checks availability only, does not create bookings.
      </footer>
    </div>
  );
}

export default App;
