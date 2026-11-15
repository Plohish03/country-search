import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { debounce } from "../core/debounce.js";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("вызывает fn после задержки, а не сразу", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);
    debounced();
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("несколько вызовов подряд дают одно срабатывание", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);
    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("fn получает аргументы последнего вызова", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);
    debounced("s");
    debounced("sp");
    debounced("spa");
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
