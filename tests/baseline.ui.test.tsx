import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '@/App';

function setTime(label: string, value: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function clickCheck() {
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
}

function getResultText(): string | null {
  const avail = screen.queryByRole('heading', { level: 3, name: 'Available' });
  const unavail = screen.queryByRole('heading', { level: 3, name: 'Unavailable' });
  if (avail) return 'Available';
  if (unavail) return 'Unavailable';
  return null;
}

function getErrorText(): string | null {
  const el = screen.queryByText('End time must be after start time.');
  return el ? el.textContent : null;
}

function selectRoom(roomName: string) {
  const radio = screen.getByRole('radio', { name: roomName });
  fireEvent.click(radio);
}

describe('Baseline UI tests — current App behavior', () => {
  afterEach(() => cleanup());

  it('AC4: 11:00–12:00 is Available (touching endpoints do not overlap)', () => {
    render(<App />);
    setTime('Start time', '11:00');
    setTime('End time', '12:00');
    clickCheck();
    expect(getResultText()).toBe('Available');
  });

  it('AC4: 10:30–11:30 is Unavailable (overlaps 10:00–11:00 booking)', () => {
    render(<App />);
    setTime('Start time', '10:30');
    setTime('End time', '11:30');
    clickCheck();
    expect(getResultText()).toBe('Unavailable');
  });

  it('AC2: 12:00–14:00 is Available (exactly 120 minutes allowed)', () => {
    render(<App />);
    setTime('Start time', '12:00');
    setTime('End time', '14:00');
    clickCheck();
    expect(getResultText()).toBe('Available');
  });

  it('AC2: 12:00–14:01 is Unavailable (121 minutes exceeds max)', () => {
    render(<App />);
    setTime('Start time', '12:00');
    setTime('End time', '14:01');
    clickCheck();
    expect(getResultText()).toBe('Unavailable');
  });

  it('AC1: 09:00–09:30 is Unavailable (start must be strictly after now)', () => {
    render(<App />);
    setTime('Start time', '09:00');
    setTime('End time', '09:30');
    clickCheck();
    expect(getResultText()).toBe('Unavailable');
  });

  it('AC1: 23:00–00:00 is Available (00:00 in End means 24:00/1440)', () => {
    render(<App />);
    setTime('Start time', '23:00');
    setTime('End time', '00:00');
    clickCheck();
    expect(getResultText()).toBe('Available');
  });

  it('AC6: 12:00–11:00 shows "End time must be after start time."', () => {
    render(<App />);
    setTime('Start time', '12:00');
    setTime('End time', '11:00');
    clickCheck();
    expect(getErrorText()).toBe('End time must be after start time.');
  });

  it('AC3: blocked room makes 11:00–12:00 Unavailable', () => {
    render(<App />);
    selectRoom('Meeting Room 405');
    setTime('Start time', '11:00');
    setTime('End time', '12:00');
    clickCheck();
    expect(getResultText()).toBe('Unavailable');
    expect(screen.getByText('Room is blocked by administration.')).toBeInTheDocument();
  });
});
