import { toHHMM } from './time';

export const MAX_DURATION = 120;

import type { Booking, Room as CatalogRoom } from '@/data/rooms';

export type { Booking };
// Single source of truth: the rule needs only these two fields of a catalog room.
export type Room = Pick<CatalogRoom, 'blocked' | 'bookings'>;

export type Result =
  | { kind: 'available' }
  | { kind: 'unavailable'; reason: string };

export function checkAvailability(
  start: number,
  end: number,
  now: number,
  room: Room
): Result {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { kind: 'unavailable', reason: 'Times must be whole minutes.' };
  }

  if (start < 0 || end > 1440 || start >= end) {
    return { kind: 'unavailable', reason: 'Times must be between 00:00 and 24:00 with start before end.' };
  }

  if (room.blocked) {
    return { kind: 'unavailable', reason: 'Room is blocked by administration.' };
  }

  if (start <= now) {
    return {
      kind: 'unavailable',
      reason: `Start time must be strictly after the current time (${toHHMM(now)}).`,
    };
  }

  if (end - start > MAX_DURATION) {
    return {
      kind: 'unavailable',
      reason: `Duration exceeds the ${MAX_DURATION}-minute maximum (you requested ${end - start} min).`,
    };
  }

  for (const b of room.bookings) {
    // touching endpoints do NOT overlap
    if (start < b.end && end > b.start) {
      return {
        kind: 'unavailable',
        reason: `Overlaps with existing booking ${toHHMM(b.start)}–${toHHMM(b.end)}.`,
      };
    }
  }

  return { kind: 'available' };
}
