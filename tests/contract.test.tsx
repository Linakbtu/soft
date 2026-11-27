import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

function check(room: string, start: string, end: string) {
  fireEvent.click(screen.getByRole('radio', { name: new RegExp(room) }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: end } });
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
}
const heading = () =>
  screen.queryByRole('heading', { level: 3, name: /^(Available|Unavailable)$/ })?.textContent ?? null;
const R204 = 'Room 204';

describe('Common test suite T01-T14', () => {
  const cases: [string, string, string, string, string | null, string][] = [
    ['T01', R204, '11:00', '12:00', 'Available', 'Room 204 is available for your requested time slot.'],
    ['T02', R204, '10:30', '11:30', 'Unavailable', 'Overlaps with existing booking 10:00–11:00.'],
    ['T03', R204, '12:00', '14:00', 'Available', 'Room 204 is available for your requested time slot.'],
    ['T04', R204, '12:00', '14:01', 'Unavailable', 'Duration exceeds the 120-minute maximum (you requested 121 min).'],
    ['T05', R204, '09:00', '09:30', 'Unavailable', 'Start time must be strictly after the current time (09:00).'],
    ['T06', R204, '09:01', '09:30', 'Available', 'Room 204 is available for your requested time slot.'],
    ['T07', R204, '12:00', '11:00', null, 'End time must be after start time.'],
    ['T08', R204, '', '10:00', null, 'Please fill in both start and end times.'],
    ['T09', 'Meeting Room 405', '11:00', '12:00', 'Unavailable', 'Room is blocked by administration.'],
    ['T10', 'Computer Lab 310', '11:00', '12:00', 'Unavailable', 'Overlaps with existing booking 11:00–12:30.'],
    ['T11', R204, '23:00', '00:00', 'Available', 'Room 204 is available for your requested time slot.'],
    ['T14', 'Lecture Hall 101', '13:30', '14:00', 'Unavailable', 'Overlaps with existing booking 13:00–15:00.'],
  ];
  for (const [id, room, s, e, head, text] of cases) {
    it(`${id} ${room} ${s || '(empty)'}-${e}`, () => {
      render(<App />);
      check(room, s, e);
      expect(heading()).toBe(head);
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  }

  it('T12 repeated Check gives the same result', () => {
    render(<App />);
    check(R204, '11:00', '12:00');
    expect(heading()).toBe('Available');
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(heading()).toBe('Available');
  });

  it('T13 switching room re-checks with the new room', () => {
    render(<App />);
    check(R204, '11:00', '12:00');
    expect(heading()).toBe('Available');
    fireEvent.click(screen.getByRole('radio', { name: /Computer Lab 310/ }));
    expect(heading()).toBe('Unavailable');
    expect(screen.getByText('Overlaps with existing booking 11:00–12:30.')).toBeInTheDocument();
  });
});
