import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

const heading = () =>
  screen.queryByRole('heading', { level: 3, name: /^(Available|Unavailable)$/ })?.textContent ?? null;

describe('Review fix F1: no stale result after editing a time', () => {
  function checkRoom204(start: string, end: string) {
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: start } });
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: end } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
  }

  it('editing Start time clears the old result', () => {
    render(<App />);
    checkRoom204('11:00', '12:00');
    expect(heading()).toBe('Available');
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '10:30' } });
    expect(heading()).toBeNull();
  });

  it('editing End time clears the old result', () => {
    render(<App />);
    checkRoom204('11:00', '12:00');
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '14:30' } });
    expect(heading()).toBeNull();
  });

  it('after editing, Check gives the result for the new times', () => {
    render(<App />);
    checkRoom204('11:00', '12:00');
    checkRoom204('10:30', '11:30');
    expect(heading()).toBe('Unavailable');
    expect(screen.getByText('Overlaps with existing booking 10:00–11:00.')).toBeInTheDocument();
  });
});
