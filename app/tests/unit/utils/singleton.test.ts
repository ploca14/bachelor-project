import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { singletonScope, requestScope } from "~/server/utils/singleton";
import type { H3EventContext } from "h3";

describe("singletonScope", () => {
  it("should return the same instance for multiple calls", () => {
    const instanceCreator = vi.fn().mockReturnValue({});
    const singleton = singletonScope(instanceCreator);

    const instance1 = singleton();
    const instance2 = singleton();

    expect(instance1).toBe(instance2);
    expect(instanceCreator).toHaveBeenCalledTimes(1);
  });
});

const createContext = () => {
  const context: H3EventContext = {};
  vi.stubGlobal("useEvent", () => ({ context }));
};

describe("requestScope", () => {
  beforeEach(() => {
    createContext();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return the same instance for multiple calls within the same context", () => {
    const instanceCreator = vi.fn().mockReturnValue({});
    const requestScoped = requestScope(instanceCreator);

    const instance1 = requestScoped();
    const instance2 = requestScoped();

    expect(instance1).toBe(instance2);
    expect(instanceCreator).toHaveBeenCalledTimes(1);
  });

  it("should return different instances for calls within different contexts", () => {
    const instanceCreator = vi.fn().mockImplementation(() => ({}));
    const requestScoped = requestScope(instanceCreator);

    const instance1 = requestScoped();
    createContext();
    const instance2 = requestScoped();

    expect(instance1).not.toBe(instance2);
    expect(instanceCreator).toHaveBeenCalledTimes(2);
  });
});
