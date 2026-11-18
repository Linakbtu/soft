export const NOW_MIN = 600; // 09:00

export const EQUIPMENT = [
  'projector',
  'whiteboard',
  'computers',
  'video conference',
  'microphone',
] as const;

export type Equipment = (typeof EQUIPMENT)[number];

export type Booking = { readonly start: number; readonly end: number };

export type Room = {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly Equipment[];
  readonly blocked: boolean;
  readonly bookings: readonly Booking[];
};

function freezeRoom(r: Omit<Room, 'bookings'> & { bookings: Booking[] }): Room {
  r.bookings.forEach((b) => Object.freeze(b));
  Object.freeze(r.bookings);
  Object.freeze(r.equipment);
  return Object.freeze(r) as Room;
}

const ROOMS: Room[] = [
  freezeRoom({
    id: 'R204',
    name: 'Room 204',
    capacity: 30,
    equipment: ['projector', 'whiteboard'],
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
  }),
  freezeRoom({
    id: 'H101',
    name: 'Lecture Hall 101',
    capacity: 120,
    equipment: ['projector', 'microphone', 'video conference'],
    blocked: false,
    bookings: [
      { start: 570, end: 690 },
      { start: 780, end: 900 },
    ],
  }),
  freezeRoom({
    id: 'L310',
    name: 'Computer Lab 310',
    capacity: 24,
    equipment: ['computers', 'projector', 'whiteboard'],
    blocked: false,
    bookings: [{ start: 660, end: 750 }],
  }),
  freezeRoom({
    id: 'S12',
    name: 'Study Room 12',
    capacity: 6,
    equipment: ['whiteboard'],
    blocked: false,
    bookings: [],
  }),
  freezeRoom({
    id: 'M405',
    name: 'Meeting Room 405',
    capacity: 10,
    equipment: ['video conference', 'whiteboard'],
    blocked: true,
    bookings: [{ start: 840, end: 900 }],
  }),
];

Object.freeze(ROOMS);

export { ROOMS };
