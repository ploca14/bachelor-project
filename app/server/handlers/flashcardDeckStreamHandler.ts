import type { EventBus, Message } from "~/server/services/eventBus";

export const flashcardDeckStreamHandler = (eventBus: EventBus) => {
  const execute = async (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
      onError?: (event?: Message) => void;
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

    await eventBus.once(`flashcardDeck:${testId}:error`, (error) => {
      unsubscribe();
      callbacks?.onError?.(error);
    });
  };

  return { execute };
};

import { useEventBus } from "~/server/services/eventBus";

export const useFlashcardDeckStreamHandler = () => {
  const eventBus = useEventBus();

  return flashcardDeckStreamHandler(eventBus);
};
