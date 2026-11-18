import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ResultCard } from '@/components/ResultCard';

afterEach(() => cleanup());

describe('ResultCard', () => {
  it('available result renders heading "Available" and the room-available message', () => {
    render(<ResultCard result={{ kind: 'available' }} roomName="Room 204" />);

    expect(screen.getByRole('heading', { level: 3, name: 'Available' })).toBeInTheDocument();
    expect(screen.getByText('Room 204 is available for your requested time slot.')).toBeInTheDocument();
  });

  it('unavailable result renders heading "Unavailable" and the reason text', () => {
    render(
      <ResultCard
        result={{ kind: 'unavailable', reason: 'Room is blocked by administration.' }}
        roomName="Meeting Room 405"
      />
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Room is blocked by administration.')).toBeInTheDocument();
  });
});
