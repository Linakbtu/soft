import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import App from '@/App';

afterEach(() => cleanup());

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

describe('Mitigation 1 — current time is 09:00 (literal, no NOW_MIN import)', () => {
  it('the page shows "Current time:" with "09:00"', () => {
    render(<App />);
    const label = screen.getByText('Current time:');
    expect(label).toBeInTheDocument();
    expect(within(label.parentElement!).getByText('09:00')).toBeInTheDocument();
  });

  it('Room 204, 09:01–09:30 is Available (one minute after now)', () => {
    render(<App />);
    setTime('Start time', '09:01');
    setTime('End time', '09:30');
    clickCheck();
    expect(getResultText()).toBe('Available');
  });

  it('Room 204, 09:00–09:30 is Unavailable (start equals now)', () => {
    render(<App />);
    setTime('Start time', '09:00');
    setTime('End time', '09:30');
    clickCheck();
    expect(getResultText()).toBe('Unavailable');
  });
});

describe('Mitigation 2 — no low-contrast text-slate-400 carries letters or digits', () => {
  it('every element with class text-slate-400 has no letters or digits in its text', () => {
    render(<App />);
    const offenders: string[] = [];
    const els = document.querySelectorAll('.text-slate-400');
    els.forEach((el) => {
      const text = el.textContent ?? '';
      if (/[A-Za-z0-9]/.test(text)) {
        offenders.push(`"${text.trim()}"`);
      }
    });
    expect(offenders).toEqual([]);
  });
});
