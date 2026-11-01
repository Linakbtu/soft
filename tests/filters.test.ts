import { describe, it, expect } from 'vitest';
import { ROOMS, NOW_MIN, type Room } from '@/data/rooms';
import { fitsCapacity, hasAllEquipment, filterRooms, parseAttendees } from '@/domain/filters';
import { checkAvailability } from '@/domain/availability';

const roomById = (id: string): Room => {
  const r = ROOMS.find((room) => room.id === id);
  if (!r) throw new Error(`Room ${id} not found`);
  return r;
};

describe('Room catalog structure', () => {
  it('has at least 4 rooms', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it('every room has all 6 fields', () => {
    for (const r of ROOMS) {
      expect(typeof r.id).toBe('string');
      expect(typeof r.name).toBe('string');
      expect(typeof r.capacity).toBe('number');
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe('boolean');
      expect(Array.isArray(r.bookings)).toBe(true);
    }
  });

  it('ids are unique', () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Room catalog is deeply frozen', () => {
  it('pushing into a room\'s bookings throws', () => {
    expect(() => {
      (roomById('R204').bookings as { start: number; end: number }[]).push({ start: 0, end: 0 });
    }).toThrow();
  });
});

describe('F1 — capacity', () => {
  it('L310 fits 24 attendees but not 25', () => {
    expect(fitsCapacity(roomById('L310'), 24)).toBe(true);
    expect(fitsCapacity(roomById('L310'), 25)).toBe(false);
  });

  it('25 attendees leaves only R204 and H101', () => {
    const matches = filterRooms(ROOMS, { attendees: 25, equipment: [] });
    expect(matches.map((r) => r.id)).toEqual(['R204', 'H101']);
  });
});

describe('F2 — equipment', () => {
  it('L310 has computers + projector', () => {
    expect(hasAllEquipment(roomById('L310'), ['computers', 'projector'])).toBe(true);
  });

  it('R204 does not have projector + computers', () => {
    expect(hasAllEquipment(roomById('R204'), ['projector', 'computers'])).toBe(false);
  });

  it('no equipment selected returns all 5 rooms', () => {
    const matches = filterRooms(ROOMS, { attendees: 1, equipment: [] });
    expect(matches.length).toBe(5);
  });

  it('8 attendees + whiteboard returns R204, L310, M405', () => {
    const matches = filterRooms(ROOMS, { attendees: 8, equipment: ['whiteboard'] });
    expect(matches.map((r) => r.id)).toEqual(['R204', 'L310', 'M405']);
  });
});

describe('F3 — blocked room is never available', () => {
  it('M405 (blocked) 600–660 is unavailable', () => {
    const res = checkAvailability(600, 660, NOW_MIN, roomById('M405'));
    expect(res.kind).toBe('unavailable');
  });
});

describe('F4 — empty list when no room matches', () => {
  it('200 attendees returns an empty list', () => {
    const matches = filterRooms(ROOMS, { attendees: 200, equipment: [] });
    expect(matches).toEqual([]);
  });
});

describe('Same slot, different rooms', () => {
  it('660–720 is available in R204', () => {
    const res = checkAvailability(660, 720, NOW_MIN, roomById('R204'));
    expect(res.kind).toBe('available');
  });

  it('660–720 is unavailable in L310 with reason "Overlaps with existing booking 11:00–12:30."', () => {
    const res = checkAvailability(660, 720, NOW_MIN, roomById('L310'));
    expect(res).toEqual({
      kind: 'unavailable',
      reason: 'Overlaps with existing booking 11:00–12:30.',
    });
  });
});

describe('parseAttendees', () => {
  it('"12" is ok', () => {
    expect(parseAttendees('12')).toEqual({ ok: true, value: 12 });
  });

  it('"0" is not ok', () => {
    expect(parseAttendees('0').ok).toBe(false);
  });

  it('"-3" is not ok', () => {
    expect(parseAttendees('-3').ok).toBe(false);
  });

  it('"2.5" is not ok', () => {
    expect(parseAttendees('2.5').ok).toBe(false);
  });

  it('"" is not ok', () => {
    expect(parseAttendees('').ok).toBe(false);
  });
});
