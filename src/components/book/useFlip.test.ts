// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlip } from './useFlip';

function touch(el: HTMLElement, from: [number, number], to: [number, number]) {
  const mk = (type: string, x: number, y: number, key: 'touches' | 'changedTouches') =>
    new TouchEvent(type, {
      bubbles: true,
      [key]: [{ clientX: x, clientY: y, identifier: 0, target: el }],
    } as unknown as TouchEventInit);

  el.dispatchEvent(mk('touchstart', from[0], from[1], 'touches'));
  el.dispatchEvent(mk('touchend', to[0], to[1], 'changedTouches'));
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
    act(() => {
      hook.result.current.bind(el);
    });
    hook.rerender();
    return { onNext, onPrev, hook };
  };

  it('never turns the page on a wheel event - scrolling belongs to the content', () => {
    const { onNext, onPrev } = setup();

    act(() => {
      for (let i = 0; i < 20; i++) {
        el.dispatchEvent(new WheelEvent('wheel', { deltaY: 400, bubbles: true }));
      }
    });

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('does not swallow the wheel event, so inner regions can scroll', () => {
    setup();
    const e = new WheelEvent('wheel', { deltaY: 200, bubbles: true, cancelable: true });
    act(() => {
      el.dispatchEvent(e);
    });
    expect(e.defaultPrevented).toBe(false);
  });

  it('arrow keys turn pages', () => {
    const { onNext, onPrev } = setup();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('locks out a second turn until the first has finished', () => {
    const { onNext } = setup();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(onNext).toHaveBeenCalledTimes(2);
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

  it('turns forward on a leftward swipe', () => {
    const { onNext } = setup();
    act(() => {
      touch(el, [300, 200], [180, 205]);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('turns back on a rightward swipe', () => {
    const { onPrev } = setup();
    act(() => {
      touch(el, [180, 200], [320, 205]);
    });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('ignores a vertical swipe, which is a scroll', () => {
    const { onNext, onPrev } = setup();
    act(() => {
      touch(el, [200, 400], [205, 120]);
    });
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('exposes a turn function for on-screen controls', () => {
    const onNext = vi.fn();
    const { hook } = setup(onNext);
    act(() => {
      hook.result.current.turn(1);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('does nothing when disabled', () => {
    const { onNext } = setup(vi.fn(), vi.fn(), false);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      touch(el, [300, 200], [180, 205]);
    });
    expect(onNext).not.toHaveBeenCalled();
  });
});
