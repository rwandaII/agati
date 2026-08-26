// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BookPreloader } from './BookPreloader';

describe('BookPreloader', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the Agati wordmark while loading', () => {
    render(<BookPreloader />);
    expect(screen.getByText(/agati/i)).toBeDefined();
  });

  it('marks itself aria-hidden so it is never announced', () => {
    const { container } = render(<BookPreloader />);
    expect(container.querySelector('.preloader')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('removes itself once loading finishes and the minimum time has passed', () => {
    const { container } = render(<BookPreloader />);
    expect(container.querySelector('.preloader')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(container.querySelector('.preloader')).toBeNull();
  });
});
