// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cover } from './Cover';

describe('Cover', () => {
  it('invites the visitor to open the book', () => {
    render(<Cover onOpen={vi.fn()} />);
    expect(screen.getByRole('button', { name: /open the book/i })).toBeDefined();
  });

  it('calls onOpen when activated', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    render(<Cover onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /open the book/i }));
    vi.advanceTimersByTime(2000);
    expect(onOpen).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('names the library for screen readers', () => {
    render(<Cover onOpen={vi.fn()} />);
    expect(screen.getByAltText(/agati library/i)).toBeDefined();
  });
});
