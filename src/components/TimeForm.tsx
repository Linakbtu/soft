import { AlertTriangle } from 'lucide-react';

type Props = {
  startTime: string;
  endTime: string;
  onStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  submitted: boolean;
  timeError: string | null;
  checkDisabled: boolean;
};

export function TimeForm({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
  onReset,
  submitted,
  timeError,
  checkDisabled,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Check Availability</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="start" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Start time
            </label>
            <input
              id="start"
              type="time"
              value={startTime}
              onChange={onStartTimeChange}
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
              onChange={onEndTimeChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="10:30"
            />
          </div>
        </div>

        {submitted && timeError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{timeError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={checkDisabled}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
