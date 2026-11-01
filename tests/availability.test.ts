import { describe, it, expect } from 'vitest';
import { checkAvailability } from '@/domain/availability';

const NOW = 540; // 09:00
const DEFAULT_BOOKINGS = [{ start: 600, end: 660 }]; // 10:00–11:00

const room = (overrides: { blocked?: boolean; bookings?: { start: number; end: number }[] } = {}) => ({
  blocked: overrides.blocked ?? false,
  bookings: overrides.bookings ?? DEFAULT_BOOKINGS,
});

describe('checkAvailability — overlap rules (AC4)', () => {
  it('660–720 available (touching end of booking)', () => {
    expect(checkAvailability(660, 720, NOW, room()).kind).toBe('available');
  });

  it('570–600 available (touching start of booking)', () => {
    expect(checkAvailability(570, 600, NOW, room()).kind).toBe('available');
  });

  it('630–690 unavailable (partial overlap)', () => {
    expect(checkAvailability(630, 690, NOW, room()).kind).toBe('unavailable');
  });

  it('590–670 unavailable (contains booking)', () => {
    expect(checkAvailability(590, 670, NOW, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — multiple bookings', () => {
  const multi = [{ start: 600, end: 660 }, { start: 700, end: 760 }];

  it('660–700 available (between two bookings, touching both)', () => {
    expect(checkAvailability(660, 700, NOW, room({ bookings: multi })).kind).toBe('available');
  });

  it('650–710 unavailable (overlaps both bookings)', () => {
    expect(checkAvailability(650, 710, NOW, room({ bookings: multi })).kind).toBe('unavailable');
  });
});

describe('checkAvailability — blocked room (AC3)', () => {
  it('blocked room makes 660–720 unavailable', () => {
    expect(checkAvailability(660, 720, NOW, room({ blocked: true })).kind).toBe('unavailable');
  });
});

describe('checkAvailability — duration limit (AC2)', () => {
  it('720–840 available (exactly 120 minutes)', () => {
    expect(checkAvailability(720, 840, NOW, room()).kind).toBe('available');
  });

  it('720–841 unavailable (121 minutes exceeds max)', () => {
    expect(checkAvailability(720, 841, NOW, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — start after now (AC1)', () => {
  it('540–570 unavailable (start = now)', () => {
    expect(checkAvailability(540, 570, NOW, room()).kind).toBe('unavailable');
  });

  it('480–510 unavailable (start before now)', () => {
    expect(checkAvailability(480, 510, NOW, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — reversed and zero-length ranges', () => {
  it('700–660 unavailable (end before start)', () => {
    expect(checkAvailability(700, 660, NOW, room()).kind).toBe('unavailable');
  });

  it('700–700 unavailable (zero length)', () => {
    expect(checkAvailability(700, 700, NOW, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — boundary values', () => {
  it('1380–1440 available (up to end of day)', () => {
    expect(checkAvailability(1380, 1440, NOW, room()).kind).toBe('available');
  });

  it('1400–1441 unavailable (end beyond 1440)', () => {
    expect(checkAvailability(1400, 1441, NOW, room()).kind).toBe('unavailable');
  });

  it('-10–30 unavailable with now=0 (start before 0)', () => {
    expect(checkAvailability(-10, 30, 0, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — non-integer minutes', () => {
  it('660.5–720 unavailable (non-integer start)', () => {
    expect(checkAvailability(660.5, 720, NOW, room()).kind).toBe('unavailable');
  });
});

describe('checkAvailability — no mutation of bookings', () => {
  it('bookings array is not mutated after two calls', () => {
    const bookings = [{ start: 600, end: 660 }];
    const r = { blocked: false, bookings };
    checkAvailability(630, 690, NOW, r);
    checkAvailability(700, 760, NOW, r);
    expect(bookings).toEqual([{ start: 600, end: 660 }]);
    expect(bookings.length).toBe(1);
  });
});

describe('checkAvailability — reason messages', () => {
  it('reason for 630–690 is "Overlaps with existing booking 10:00–11:00."', () => {
    const res = checkAvailability(630, 690, NOW, room());
    expect(res).toEqual({
      kind: 'unavailable',
      reason: 'Overlaps with existing booking 10:00–11:00.',
    });
  });
});
