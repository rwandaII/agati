// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Paywall } from './Paywall';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const book = { slug: 'b', title: 'A Book', priceRwf: 2500, accessType: 'FREE_TRIAL' as const };

describe('Paywall', () => {
  it('tells a reader whose week ended what happened', () => {
    render(<Paywall reason="TRIAL_EXPIRED" book={book} trialEndsAt={new Date('2026-08-20')} />);
    expect(screen.getByText(/free week/i)).toBeDefined();
  });

  it('offers the book price and the subscription side by side', () => {
    render(<Paywall reason="TRIAL_EXPIRED" book={book} />);
    expect(screen.getByText(/2,500 RWF/)).toBeDefined();
    expect(screen.getByRole('link', { name: /subscrib|everything/i })).toBeDefined();
  });

  it('invites a signed-out visitor to sign in rather than to pay', () => {
    render(<Paywall reason="PREVIEW_ONLY" book={book} signedIn={false} />);
    // Both ways in are offered on purpose, so there are two matching links.
    expect(screen.getAllByRole('link', { name: /sign in|create an account/i })).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /buy this book/i })).toBeNull();
  });

  it('offers to start the free week when one is available', () => {
    render(<Paywall reason="TRIAL_AVAILABLE" book={book} signedIn />);
    expect(screen.getByRole('button', { name: /start.*free/i })).toBeDefined();
  });

  it('names the book so the reader knows what they are buying', () => {
    render(<Paywall reason="PREVIEW_ONLY" book={{ ...book, accessType: 'PAID' }} signedIn />);
    expect(screen.getByText(/A Book/)).toBeDefined();
  });

  it('says how far the reader got', () => {
    render(<Paywall reason="TRIAL_EXPIRED" book={book} pagesRead={14} />);
    expect(screen.getByText(/14 pages/i)).toBeDefined();
  });
});
