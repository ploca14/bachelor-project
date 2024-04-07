import type { EventBus, Message } from "~/server/services/eventBus";

const sampleTestStreamHandler = (eventBus: EventBus) => {
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

import { useEventBus } from "~/server/services/eventBus";

export const useSampleTestStreamHandler = () => {
  const eventBus = useEventBus();

  return sampleTestStreamHandler(eventBus);
};
