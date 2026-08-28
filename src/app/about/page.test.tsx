// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';

describe('About spread', () => {
  it("states Agati's real mission", () => {
    render(<About />);
    expect(screen.getByText(/break the cycle of poverty/i)).toBeDefined();
  });

  it('credits all six co-founders', () => {
    render(<About />);
    for (const n of [
      'Patience Karekezi',
      'Aime Mukiza',
      'Sabine Isangwe',
      'Rigobert Uwiduhaye',
      'Prosper Munyabuhoro',
      'Denyse Umuhuza',
    ]) {
      expect(screen.getByText(n), n).toBeDefined();
    }
  });

  it('names the five districts and the founding date', () => {
    const { container } = render(<About />);
    const text = container.textContent ?? '';
    for (const d of ['Musanze', 'Rubavu', 'Kicukiro', 'Nyamasheke', 'Karongi', 'April 2018']) {
      expect(text, d).toContain(d);
    }
  });
})
