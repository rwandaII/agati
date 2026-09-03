// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spread } from './Spread';

vi.mock('next/navigation', () => ({ usePathname: () => '/about' }));

describe('Spread', () => {
  it('renders both columns as real, readable DOM', () => {
    render(<Spread running="About Us" left={<p>Left side</p>} right={<p>Right side</p>} />);
    expect(screen.getByText('Left side')).toBeDefined();
    expect(screen.getByText('Right side')).toBeDefined();
  });

  it('prints the section name once, as an eyebrow', () => {
    render(<Spread running="About Us" left={null} right={null} />);
    expect(screen.getAllByText('About Us')).toHaveLength(1);
  });

  it('is a website section, not a book spread: no folio numbers', () => {
    const { container } = render(<Spread running="About Us" folio={4} left={null} right={null} />);
    expect(container.textContent).not.toContain('4');
    expect(container.textContent).not.toContain('5');
    expect(container.querySelector('.page__folio')).toBeNull();
  });

  it('lays the two halves out in columns', () => {
    const { container } = render(<Spread running="X" left={<p>L</p>} right={<p>R</p>} />);
    expect(container.querySelectorAll('.columns__col')).toHaveLength(2);
  });
})
