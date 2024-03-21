import type { EventBus, Message } from "~/server/services/eventBus";

const flashcardDeckStreamHandler = (eventBus: EventBus) => {
  const execute = async (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
    },
  ) => {
    const unsubscribe = await eventBus.subscribe(
      `flashcardDeck:${testId}:progress`,
      callbacks?.onProgress ?? (() => {}),
    );

    await eventBus.once(`flashcardDeck:${testId}:complete`, () => {
      unsubscribe();
      callbacks?.onComplete?.();
    });
  };

  return { execute };
};

import { useEventBus } from "~/server/services/eventBus";

export const useFlashcardDeckStreamHandler = () => {
  const eventBus = useEventBus();

  return flashcardDeckStreamHandler(eventBus);
};
