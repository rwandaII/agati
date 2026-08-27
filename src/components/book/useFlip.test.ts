// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlip } from './useFlip';
import { WHEEL_THRESHOLD } from './constants';

function wheel(el: HTMLElement, deltaY: number) {
  el.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }));
}

describe('useFlip', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
    vi.useRealTimers();
  });

  const setup = (onNext = vi.fn(), onPrev = vi.fn(), enabled = true) => {
    const hook = renderHook(() => useFlip({ onNext, onPrev, enabled }));
    act(() => { hook.result.current.bind(el); });
    hook.rerender();
    return { onNext, onPrev, hook };
  };

  it('does not turn until the accumulated scroll passes the threshold', () => {
    const { onNext } = setup();
    act(() => { wheel(el, WHEEL_THRESHOLD / 3); });
    expect(onNext).not.toHaveBeenCalled();

    act(() => { wheel(el, WHEEL_THRESHOLD); });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('turns exactly once per flick, however violent the wheel', () => {
    const { onNext } = setup();
    act(() => { for (let i = 0; i < 20; i++) wheel(el, 400); });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('allows the next turn once the lockout expires', () => {
    const { onNext } = setup();
    act(() => { wheel(el, 400); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { wheel(el, 400); });
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('scrolling up turns backwards', () => {
    const { onPrev } = setup();
    act(() => { wheel(el, -400); });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('arrow keys turn pages', () => {
    const { onNext, onPrev } = setup();
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('ignores keys typed into a form field', () => {
    const { onNext } = setup();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(onNext).not.toHaveBeenCalled();
    input.remove();
  });

  it('does nothing when disabled', () => {
    const { onNext } = setup(vi.fn(), vi.fn(), false);
    act(() => { wheel(el, 900); });
    expect(onNext).not.toHaveBeenCalled();
  });
});
