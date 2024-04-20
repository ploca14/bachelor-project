import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { EventBus } from "~/server/tools/eventBus";
import { flashcardDeckStreamHandler } from "~/server/handlers/flashcardDeckStreamHandler";

describe("flashcardDeckStreamHandler", () => {
  let eventBus: MockProxy<EventBus>;
  let handler: any;

  beforeEach(() => {
    eventBus = mock<EventBus>();
    handler = flashcardDeckStreamHandler(eventBus);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should subscribe to progress, complete, and error events", async () => {
    const testId = "test1";
    const callbacks = {
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    eventBus.subscribe.mockResolvedValue(vi.fn());
    eventBus.once.mockResolvedValue(undefined);

    await handler.execute(testId, callbacks);

    expect(eventBus.subscribe).toHaveBeenCalledWith(
      `flashcardDeck:${testId}:progress`,
      expect.any(Function),
    );
    expect(eventBus.once).toHaveBeenCalledWith(
      `flashcardDeck:${testId}:complete`,
      expect.any(Function),
    );
    expect(eventBus.once).toHaveBeenCalledWith(
      `flashcardDeck:${testId}:error`,
      expect.any(Function),
    );
  });

  it("should call onProgress when progress event is received", async () => {
    const testId = "test1";
    const callbacks = {
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    const unsubscribe = vi.fn();
    eventBus.subscribe.mockImplementation(async (event, callback) => {
      if (event.endsWith(":progress")) {
        callback("Test progress");
      }

      return unsubscribe;
    });

    await handler.execute(testId, callbacks);

    expect(callbacks.onProgress).toHaveBeenCalledWith("Test progress");
  });

  it("should call onComplete and unsubscribe when complete event is received", async () => {
    const testId = "test1";
    const callbacks = {
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    const unsubscribe = vi.fn();
    eventBus.subscribe.mockResolvedValue(unsubscribe);
    eventBus.once.mockImplementation((event, callback) => {
      if (event.endsWith(":complete")) {
        callback([]);
      }
      return Promise.resolve();
    });

    await handler.execute(testId, callbacks);

    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should call onError and unsubscribe when error event is received", async () => {
    const testId = "test1";
    const callbacks = {
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    const unsubscribe = vi.fn();
    eventBus.subscribe.mockResolvedValue(unsubscribe);
    eventBus.once.mockImplementation((event, callback) => {
      if (event.endsWith(":error")) {
        callback("Test error");
      }
      return Promise.resolve();
    });

    await handler.execute(testId, callbacks);

    expect(callbacks.onError).toHaveBeenCalledWith("Test error");
    expect(unsubscribe).toHaveBeenCalled();
  });
});
