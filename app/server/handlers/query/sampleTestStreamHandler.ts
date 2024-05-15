import type { EventBus, Message } from "~/server/tools/eventBus";

export interface SampleTestStreamHandler {
  execute: (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
      onError?: (event?: Message) => void;
    },
  ) => Promise<void>;
}

const sampleTestStreamHandler = (
  eventBus: EventBus,
): SampleTestStreamHandler => {
  const execute = async (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
      onError?: (event?: Message) => void;
    },
  ) => {
    const unsubscribe = await eventBus.subscribe(
      `sampleTest:${testId}:progress`,
      callbacks?.onProgress ?? (() => {}),
    );

    await eventBus.once(`sampleTest:${testId}:complete`, () => {
      unsubscribe();
      callbacks?.onComplete?.();
    });

    await eventBus.once(`sampleTest:${testId}:error`, (error) => {
      unsubscribe();
      callbacks?.onError?.(error);
    });
  };

  return { execute };
};
/* v8 ignore start */
import { useEventBus } from "~/server/tools/eventBus";

export const useSampleTestStreamHandler = () => {
  const eventBus = useEventBus();

  return sampleTestStreamHandler(eventBus);
};
