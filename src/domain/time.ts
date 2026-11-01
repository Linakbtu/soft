export function toMinutes(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

export function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export type ParseResult =
  | { ok: true; start: number; end: number }
  | { ok: false; error: string };

export function parseTimeRange(startText: string, endText: string): ParseResult {
  if (!startText || !endText) {
    return { ok: false, error: 'Please fill in both start and end times.' };
  }

  const start = toMinutes(startText);
  let end = toMinutes(endText);

  if (start === null || end === null) {
    return { ok: false, error: 'Times must be in HH:MM format (e.g. 09:30).' };
  }

  // Treat 00:00 in the End field as 24:00 (1440), since end = 0 can never be valid.
  if (end === 0) end = 1440;

  if (end <= start) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  return { ok: true, start, end };
}
