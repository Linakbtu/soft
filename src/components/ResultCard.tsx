import { Check, X } from 'lucide-react';
import type { Result } from '@/domain/availability';

type Props = {
  result: Result;
  roomName: string;
};

const styles = {
  available: {
    section: 'bg-green-50 border-green-300',
    icon: 'bg-green-500',
    heading: 'text-green-800',
    text: 'text-green-600',
  },
  unavailable: {
    section: 'bg-red-50 border-red-300',
    icon: 'bg-red-500',
    heading: 'text-red-800',
    text: 'text-red-600',
  },
} as const;

export function ResultCard({ result, roomName }: Props) {
  const s = styles[result.kind];

  return (
    <section
      className={`rounded-2xl border-2 shadow-sm p-5 sm:p-6 transition-all animate-in ${s.section}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}
        >
          {result.kind === 'available' ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <X className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${s.heading}`}>
            {result.kind === 'available' ? 'Available' : 'Unavailable'}
          </h3>
          {result.kind === 'unavailable' && (
            <p className={`text-sm ${s.text} mt-0.5`}>{result.reason}</p>
          )}
          {result.kind === 'available' && (
            <p className={`text-sm ${s.text} mt-0.5`}>
              {roomName} is available for your requested time slot.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
