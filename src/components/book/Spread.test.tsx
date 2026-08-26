// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spread } from './Spread';

vi.mock('next/navigation', () => ({ usePathname: () => '/about' }));

describe('Spread', () => {
  it('renders both pages as real, readable DOM', () => {
    render(<Spread running="About Us" folio={4} left={<p>Left side</p>} right={<p>Right side</p>} />);
    expect(screen.getByText('Left side')).toBeDefined();
    expect(screen.getByText('Right side')).toBeDefined();
  });

  it('prints the running head and both folio numbers', () => {
    render(<Spread running="About Us" folio={4} left={null} right={null} />);
    expect(screen.getAllByText('About Us').length).toBe(2);
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });
});
