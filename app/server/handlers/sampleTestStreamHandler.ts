import type { EventBus, Message } from "~/server/services/eventBus";

const sampleTestStreamHandler = (eventBus: EventBus) => {
  const execute = async (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
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
  };

  return { execute };
};

import { useEventBus } from "~/server/services/eventBus";

export const useSampleTestStreamHandler = () => {
  const eventBus = useEventBus();

  return sampleTestStreamHandler(eventBus);
};
