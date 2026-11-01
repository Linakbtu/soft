import { MapPin, Clock, CalendarDays } from 'lucide-react';
import { toHHMM } from '@/domain/time';
import { NOW_MIN } from '@/data/rooms';
import type { Room } from '@/data/rooms';
import { Timeline } from './Timeline';

type Props = {
  room: Room;
};

export function RoomDetails({ room }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{room.name}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Current time: <span className="font-semibold text-slate-700">{toHHMM(NOW_MIN)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Existing Bookings
        </p>
        <div className="flex flex-wrap gap-2">
          {room.bookings.length === 0 ? (
            <span className="text-sm text-slate-400">No existing bookings</span>
          ) : (
            room.bookings.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {toHHMM(b.start)}–{toHHMM(b.end)}
              </span>
            ))
          )}
        </div>
      </div>

      <Timeline bookings={room.bookings} />
    </section>
  );
}
