import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '@/App';

function setAttendees(value: string) {
  const input = screen.getByLabelText('Attendees') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function setTime(label: string, value: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function clickCheck() {
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
}

function selectRoom(roomName: string) {
  fireEvent.click(screen.getByRole('radio', { name: roomName }));
}

function toggleEquipment(item: string) {
  fireEvent.click(screen.getByLabelText(item));
}

function getResultText(): string | null {
  const avail = screen.queryByRole('heading', { level: 3, name: 'Available' });
  const unavail = screen.queryByRole('heading', { level: 3, name: 'Unavailable' });
  if (avail) return 'Available';
  if (unavail) return 'Unavailable';
  return null;
}

afterEach(() => cleanup());

describe('App UI — room catalog and filtering', () => {
  it('5 rooms are shown by default', () => {
    render(<App />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('20 attendees + computers shows only Computer Lab 310', () => {
    render(<App />);
    setAttendees('20');
    toggleEquipment('computers');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Computer Lab 310' })).toBeInTheDocument();
  });

  it('500 attendees shows the empty-state text and Check is disabled', () => {
    render(<App />);
    setAttendees('500');
    expect(screen.getByText('No rooms match your requirements.')).toBeInTheDocument();
    expect(screen.getByText('Try fewer attendees or remove some equipment.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
  });

  it('attendees "0" shows the alert "Attendees must be at least 1."', () => {
    render(<App />);
    setAttendees('0');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Attendees must be at least 1.');
  });
});

describe('App UI — F5: changing room re-checks the same slot', () => {
  it('11:00–12:00 Available in R204, Unavailable in L310, Available again in R204', () => {
    render(<App />);
    setTime('Start time', '11:00');
    setTime('End time', '12:00');
    clickCheck();
    expect(getResultText()).toBe('Available');

    selectRoom('Computer Lab 310');
    expect(getResultText()).toBe('Unavailable');
    expect(screen.getByText('Overlaps with existing booking 11:00–12:30.')).toBeInTheDocument();

    selectRoom('Room 204');
    expect(getResultText()).toBe('Available');
  });

  it('after checking, changing attendees to 100 hides the result and shows "Select a matching room"', () => {
    render(<App />);
    setTime('Start time', '11:00');
    setTime('End time', '12:00');
    clickCheck();
    expect(getResultText()).toBe('Available');

    setAttendees('100');
    expect(getResultText()).toBeNull();
    expect(screen.getByText('Select a matching room above to check a time slot.')).toBeInTheDocument();
  });
});
