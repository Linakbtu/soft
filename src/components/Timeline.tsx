import { NOW_MIN, type Booking } from '@/data/rooms';
import { toHHMM } from '@/domain/time';

const RANGE_START = 8 * 60;
const RANGE_END = 18 * 60;
const RANGE_TOTAL = RANGE_END - RANGE_START;

type Props = {
  bookings: readonly Booking[];
};

export function Timeline({ bookings }: Props) {
  const bookedSegs = bookings
    .filter((b) => b.end > RANGE_START && b.start < RANGE_END)
    .map((b) => ({
      left: ((Math.max(b.start, RANGE_START) - RANGE_START) / RANGE_TOTAL) * 100,
      width: ((Math.min(b.end, RANGE_END) - Math.max(b.start, RANGE_START)) / RANGE_TOTAL) * 100,
    }));

  const nowPct = ((NOW_MIN - RANGE_START) / RANGE_TOTAL) * 100;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
        <span>{toHHMM(RANGE_START)}</span>
        <span>{toHHMM((RANGE_START + RANGE_END) / 2)}</span>
        <span>{toHHMM(RANGE_END)}</span>
      </div>
      <div className="relative h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
        {bookedSegs.map((seg, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 bg-amber-300/80 border-x border-amber-400 flex items-center justify-center"
            style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
          >
            <span className="text-[9px] font-bold text-amber-800 truncate px-1">Booked</span>
          </div>
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
          style={{ left: `${nowPct}%` }}
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
  );
}
