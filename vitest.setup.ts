export {};

// DOM matchers only make sense in the jsdom environment.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
}
