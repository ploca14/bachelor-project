import { IterableReadableStream } from "@langchain/core/utils/stream";

export function combineLatest<T>(
  streams: ReadableStream<T>[],
  options?: { onEnd?: (value: T[]) => void },
) {
  return IterableReadableStream.fromReadableStream(
    new ReadableStream<T[]>({
      async start(controller) {
        const readers = streams.map((stream) => stream.getReader());
        const latestValues = new Array<T>(streams.length);
        const hasValue = new Array(streams.length).fill(false);

        const promises = readers.map((reader, index) =>
          (async () => {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                return;
              }

              hasValue[index] = true;
              latestValues[index] = value;

              if (hasValue.every(Boolean)) {
                controller.enqueue([...latestValues]);
              }
            }
          })(),
        );

        await Promise.allSettled(promises);
        controller.close();

        if (options?.onEnd) {
          options.onEnd(latestValues);
        }
      },
    }),
  );
}
