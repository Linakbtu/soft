import { Lock } from 'lucide-react';
import type { Room } from '@/data/rooms';

type Props = {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  empty: boolean;
  attendeesInvalid: boolean;
};

export function RoomList({ rooms, selectedRoomId, onSelectRoom, empty, attendeesInvalid }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Matching Rooms</h3>
      {empty ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-slate-700">No rooms match your requirements.</p>
          <p className="text-sm text-slate-500 mt-1">Try fewer attendees or remove some equipment.</p>
        </div>
      ) : attendeesInvalid ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">Fix the attendees field to see matching rooms.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <label
              key={room.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none ${
                selectedRoomId === room.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="room"
                value={room.id}
                checked={selectedRoomId === room.id}
                onChange={() => onSelectRoom(room.id)}
                aria-label={room.name}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{room.name}</span>
                  {room.blocked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                      <Lock className="w-3 h-3" />
                      Blocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {room.capacity} seats · {room.equipment.join(', ')}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
