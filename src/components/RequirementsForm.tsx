import { Users, Monitor } from 'lucide-react';
import { EQUIPMENT, type Equipment } from '@/data/rooms';
import type { ParseAttendeesResult } from '@/domain/filters';

type Props = {
  attendeesText: string;
  onAttendeesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedEquipment: Equipment[];
  onToggleEquipment: (item: Equipment) => void;
  attendeesResult: ParseAttendeesResult;
};

export function RequirementsForm({
  attendeesText,
  onAttendeesChange,
  selectedEquipment,
  onToggleEquipment,
  attendeesResult,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Requirements</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="attendees" className="block text-xs font-semibold text-slate-600 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Attendees
            </span>
          </label>
          <input
            id="attendees"
            type="number"
            min={1}
            value={attendeesText}
            onChange={onAttendeesChange}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="1"
          />
          {!attendeesResult.ok && (
            <p role="alert" className="text-sm text-red-600 mt-1.5">{attendeesResult.error}</p>
          )}
        </div>

        <div>
          <p className="block text-xs font-semibold text-slate-600 mb-2">
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" />
              Equipment
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedEquipment.includes(item)}
                  onChange={() => onToggleEquipment(item)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
