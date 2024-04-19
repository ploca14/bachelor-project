import { describe, expect, it, beforeEach, vi, type Mock } from "vitest";
import { EventEmitter } from "events";
import { eventEmitterEventBus } from "~/server/services/eventBus";

describe("eventEmitterEventBus", () => {
  let eventEmitter: EventEmitter;
  let eventBus: ReturnType<typeof eventEmitterEventBus>;
  let mockCallback: Mock;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    eventBus = eventEmitterEventBus(eventEmitter);
    mockCallback = vi.fn();
  });

  it("publish should emit an event with a message", async () => {
    const topic = "test-topic";
    const message = { data: "test-data" };

    eventEmitter.on(topic, mockCallback);
    await eventBus.publish(topic, message);

    expect(mockCallback).toHaveBeenCalledWith(message);
  });

  it("subscribe should register a callback for an event", async () => {
    const topic = "test-topic";
    const message = { data: "test-data" };

    await eventBus.subscribe(topic, mockCallback);
    eventEmitter.emit(topic, message);

    expect(mockCallback).toHaveBeenCalledWith(message);
  });

  it("subscribe should return a function to unsubscribe", async () => {
    const topic = "test-topic";
    const message = { data: "test-data" };

    const unsubscribe = await eventBus.subscribe(topic, mockCallback);
    unsubscribe();
    eventEmitter.emit(topic, message);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("once should register a one-time callback for an event", async () => {
    const topic = "test-topic";
    const message = { data: "test-data" };

    await eventBus.once(topic, mockCallback);
    eventEmitter.emit(topic, message);
    eventEmitter.emit(topic, message);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(message);
  });
});
