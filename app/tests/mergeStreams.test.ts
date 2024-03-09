import { combineLatest } from "~/server/utils/mergeStreams";
import { describe, it, expect } from "vitest";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("combineLatest", async () => {
  it("should combine streams correctly", async () => {
    const stream1 = ReadableStream.from([1, 2, 3]);
    const stream2 = ReadableStream.from([4, 5, 6]);

    const combinedStream = combineLatest([stream1, stream2]);

    let result = [];
    for await (const value of combinedStream) {
      result.push(value);
    }

    expect(result).toEqual([
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 5],
      [3, 6],
    ]);
  });

  it("should handle empty streams", async () => {
    const stream1 = ReadableStream.from([]);
    const stream2 = ReadableStream.from([]);
    const combinedStream = combineLatest([stream1, stream2]);

    let result = [];
    for await (const value of combinedStream) {
      result.push(value);
    }

    expect(result).toEqual([]);
  });

  it("should handle streams of different lengths", async () => {
    const stream1 = ReadableStream.from([1, 2]);
    const stream2 = ReadableStream.from([3, 4, 5]);

    const combinedStream = combineLatest([stream1, stream2]);

    let result = [];
    for await (const value of combinedStream) {
      result.push(value);
    }

    expect(result).toEqual([
      [1, 3],
      [2, 3],
      [2, 4],
      [2, 5],
    ]);
  });

  it("should handle streams with delays", async () => {
    const stream1 = new ReadableStream({
      async start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        await delay(100);
        controller.enqueue(3);
        controller.close();
      },
    });

    const stream2 = new ReadableStream({
      async start(controller) {
        controller.enqueue(4);
        await delay(50);
        controller.enqueue(5);
        controller.enqueue(6);
        controller.close();
      },
    });

    const combinedStream = combineLatest([stream1, stream2]);

    let result = [];
    for await (const value of combinedStream) {
      result.push(value);
    }

    expect(result).toEqual([
      [1, 4],
      [2, 4],
      [2, 5],
      [2, 6],
      [3, 6],
    ]);
  });

  it("should handle eager option", async () => {
    const stream1 = new ReadableStream({
      async start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      },
    });

    const stream2 = new ReadableStream({
      async start(controller) {
        await delay(100);
        controller.enqueue(4);
        controller.enqueue(5);
        controller.enqueue(6);
        controller.close();
      },
    });

    const combinedStream = combineLatest([stream1, stream2], { eager: true });

    let result = [];
    for await (const value of combinedStream) {
      result.push(value);
    }

    expect(result).toEqual([
      [1, undefined],
      [2, undefined],
      [3, undefined],
      [3, 4],
      [3, 5],
      [3, 6],
    ]);
  });
});
