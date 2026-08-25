import { describe, it, expect } from 'vitest';
import { BRAND, SITE } from './brand';

describe('brand tokens', () => {
  it('exposes every colour as a 6-digit hex', () => {
    for (const [name, value] of Object.entries(BRAND.colors)) {
      expect(value, name).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("uses Agati's real contact address", () => {
    expect(SITE.email).toBe('info@agatilibrary.org');
  });

  it('lists all five social channels', () => {
    expect(Object.keys(SITE.social)).toHaveLength(5);
  });
});
