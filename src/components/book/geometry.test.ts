import { describe, it, expect } from 'vitest';
import { leavesFor, shouldTurn, inFrame, downFrom } from './geometry';

/** Real screens, in CSS pixels, as their browsers report them. */
const SCREENS = {
  phonePortrait: [390, 844], // iPhone 14
  phoneLandscape: [844, 390],
  smallPhonePortrait: [375, 667], // iPhone SE
  smallPhoneLandscape: [667, 375],
  tinyPhonePortrait: [320, 568], // iPhone 5
  tinyPhoneLandscape: [568, 320],
  tabletPortrait: [768, 1024], // iPad 9.7"
  tabletLandscape: [1024, 768],
  bigTabletPortrait: [1024, 1366], // iPad Pro 12.9"
  desktop: [1440, 900],
  narrowWindow: [700, 900],
  squarishWindow: [1000, 900],
} as const;

const leavesOn = (name: keyof typeof SCREENS) => {
  const [width, height] = SCREENS[name];
  return leavesFor(width, height);
};

describe('leavesFor', () => {
  it('opens a spread on a phone held sideways — the whole point of turning it', () => {
    expect(leavesOn('phoneLandscape')).toBe(2);
    expect(leavesOn('smallPhoneLandscape')).toBe(2);
  });

  it('shows one page on a phone held upright', () => {
    expect(leavesOn('phonePortrait')).toBe(1);
    expect(leavesOn('smallPhonePortrait')).toBe(1);
  });

  it('shows one page when a landscape screen is too narrow to hold two', () => {
    expect(leavesOn('tinyPhoneLandscape')).toBe(1);
  });

  it('leaves every screen that shows a spread today still showing one', () => {
    expect(leavesOn('desktop')).toBe(2);
    expect(leavesOn('tabletLandscape')).toBe(2);
    // A squarish desktop window is wide enough, whatever its shape.
    expect(leavesOn('squarishWindow')).toBe(2);
  });

  it('leaves every screen that shows one page today still showing one', () => {
    expect(leavesOn('tabletPortrait')).toBe(1);
    expect(leavesOn('narrowWindow')).toBe(1);
  });
});

describe('shouldTurn', () => {
  const coarse = true;
  const fine = false;

  it('turns an upright phone, which is the screen that cannot hold a spread', () => {
    expect(shouldTurn(...SCREENS.phonePortrait, coarse)).toBe(true);
    expect(shouldTurn(...SCREENS.smallPhonePortrait, coarse)).toBe(true);
  });

  it('leaves a phone that is already sideways alone', () => {
    expect(shouldTurn(...SCREENS.phoneLandscape, coarse)).toBe(false);
  });

  it('does not turn a phone too small to gain a spread by it', () => {
    expect(shouldTurn(...SCREENS.tinyPhonePortrait, coarse)).toBe(false);
  });

  it('turns an upright tablet, which is a phone problem at a larger size', () => {
    expect(shouldTurn(...SCREENS.tabletPortrait, coarse)).toBe(true);
  });

  it('leaves a tablet already wide enough for a spread standing upright', () => {
    // Nothing to gain: it opens both pages held either way round.
    expect(leavesFor(...SCREENS.bigTabletPortrait)).toBe(2);
    expect(shouldTurn(...SCREENS.bigTabletPortrait, coarse)).toBe(false);
  });

  it('never turns a screen driven by a mouse — a narrow window is not a phone', () => {
    expect(shouldTurn(500, 900, fine)).toBe(false);
    expect(shouldTurn(...SCREENS.phonePortrait, fine)).toBe(false);
  });
});

describe('inFrame', () => {
  it('leaves a swipe alone when the book is the right way up', () => {
    expect(inFrame(80, 10, false)).toEqual({ dx: 80, dy: 10 });
  });

  it('reads a swipe up the phone as a swipe forward through a turned book', () => {
    // The book is drawn a quarter-turn clockwise, so its own "right" runs
    // down the screen: a finger travelling up the glass turns the page on.
    expect(inFrame(12, -80, true)).toEqual({ dx: -80, dy: -12 });
  });

  it('reads a swipe down the phone as a swipe back through a turned book', () => {
    expect(inFrame(-12, 80, true)).toEqual({ dx: 80, dy: 12 });
  });

  it('reads a swipe across the phone as the turned book being scrolled', () => {
    expect(inFrame(80, 6, true)).toEqual({ dx: 6, dy: -80 });
  });
});

describe('downFrom', () => {
  const rect = (x: number, y: number, w: number, h: number) => ({
    top: y,
    right: x + w,
  });

  it('measures down the screen when the book is the right way up', () => {
    const page = rect(100, 40, 300, 600);
    expect(downFrom(page, rect(120, 190, 200, 18), false)).toBe(150);
  });

  it('measures across the screen when the book is turned, because its down is', () => {
    // Turned clockwise, the page's top edge lies along the right of the
    // screen, so distance down the page is distance left across the glass.
    const page = rect(0, 0, 600, 300);
    expect(downFrom(page, rect(0, 0, 450, 300), true)).toBe(150);
  });

  it('puts the first line at the top of the page either way round', () => {
    const page = rect(0, 0, 600, 300);
    expect(downFrom(page, rect(0, 0, 600, 20), true)).toBe(0);
    expect(downFrom(page, rect(0, 0, 20, 600), false)).toBe(0);
  });
});
