import type { Room, Equipment } from '@/data/rooms';

export function fitsCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

export function hasAllEquipment(room: Room, required: readonly Equipment[]): boolean {
  return required.every((item) => room.equipment.includes(item));
}

export type FilterCriteria = {
  attendees: number;
  equipment: readonly Equipment[];
};

export function filterRooms(rooms: readonly Room[], criteria: FilterCriteria): Room[] {
  return rooms.filter(
    (room) =>
      fitsCapacity(room, criteria.attendees) &&
      hasAllEquipment(room, criteria.equipment)
  );
}

export type ParseAttendeesResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export function parseAttendees(text: string): ParseAttendeesResult {
  if (text.trim() === '') {
    return { ok: false, error: 'Attendees must be a whole number (1 or more).' };
  }
  const num = Number(text);
  if (!Number.isInteger(num)) {
    return { ok: false, error: 'Attendees must be a whole number (1 or more).' };
  }
  if (num < 1) {
    return { ok: false, error: 'Attendees must be at least 1.' };
  }
  return { ok: true, value: num };
}
