import { describe, it, expect } from 'vitest';
import { parseTimeRange } from '@/domain/time';

describe('parseTimeRange — empty fields', () => {
  it('both empty', () => {
    expect(parseTimeRange('', '')).toEqual({ ok: false, error: 'Please fill in both start and end times.' });
  });

  it('start empty only', () => {
    expect(parseTimeRange('', '10:00')).toEqual({ ok: false, error: 'Please fill in both start and end times.' });
  });

  it('end empty only', () => {
    expect(parseTimeRange('10:00', '')).toEqual({ ok: false, error: 'Please fill in both start and end times.' });
  });
});

describe('parseTimeRange — bad format', () => {
  it('"9:30" is rejected (not HH:MM)', () => {
    expect(parseTimeRange('9:30', '10:30')).toEqual({ ok: false, error: 'Times must be in HH:MM format (e.g. 09:30).' });
  });
});

describe('parseTimeRange — reversed and equal times', () => {
  it('"12:00"–"11:00" is reversed', () => {
    expect(parseTimeRange('12:00', '11:00')).toEqual({ ok: false, error: 'End time must be after start time.' });
  });

  it('"12:00"–"12:00" is equal (end not after start)', () => {
    expect(parseTimeRange('12:00', '12:00')).toEqual({ ok: false, error: 'End time must be after start time.' });
  });
});

describe('parseTimeRange — 00:00 end means 24:00', () => {
  it('"23:00"–"00:00" gives start=1380, end=1440', () => {
    expect(parseTimeRange('23:00', '00:00')).toEqual({ ok: true, start: 1380, end: 1440 });
  });
});
