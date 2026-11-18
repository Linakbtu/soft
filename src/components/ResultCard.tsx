import { Check, X } from 'lucide-react';
import type { Result } from '@/domain/availability';

type Props = {
  result: Result;
  roomName: string;
};

type ResultConfig = {
  section: string;
  icon: string;
  Icon: typeof Check;
  heading: string;
  text: string;
  title: string;
  message: (result: Result, roomName: string) => string;
};

const CONFIG: Record<Result['kind'], ResultConfig> = {
  available: {
    section: 'bg-green-50 border-green-300',
    icon: 'bg-green-500',
    Icon: Check,
    heading: 'text-green-800',
    text: 'text-green-600',
    title: 'Available',
    message: (_result, roomName) => `${roomName} is available for your requested time slot.`,
  },
  unavailable: {
    section: 'bg-red-50 border-red-300',
    icon: 'bg-red-500',
    Icon: X,
    heading: 'text-red-800',
    text: 'text-red-600',
    title: 'Unavailable',
    message: (result) => (result.kind === 'unavailable' ? result.reason : ''),
  },
};

export function ResultCard({ result, roomName }: Props) {
  const c = CONFIG[result.kind];

  return (
    <section
      className={`rounded-2xl border-2 shadow-sm p-5 sm:p-6 transition-all animate-in ${c.section}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}
        >
          <c.Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${c.heading}`}>{c.title}</h3>
          <p className={`text-sm ${c.text} mt-0.5`}>{c.message(result, roomName)}</p>
        </div>
      </div>
    </section>
  );
}
