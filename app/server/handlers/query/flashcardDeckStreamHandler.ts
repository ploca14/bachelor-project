import type { EventBus, Message } from "~/server/tools/eventBus";

export interface FlashcardDeckStreamHandler {
  execute: (
    testId: string,
    callbacks?: {
      onProgress?: (event?: Message) => void;
      onComplete?: () => void;
      onError?: (event?: Message) => void;
    },
  ) => Promise<void>;
}

export const flashcardDeckStreamHandler = (
  eventBus: EventBus,
): FlashcardDeckStreamHandler => {
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
      (progress) => {
        callbacks?.onProgress?.(progress);
      },
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

/* v8 ignore start */
import { useEventBus } from "~/server/tools/eventBus";

export const useFlashcardDeckStreamHandler = () => {
  const eventBus = useEventBus();

  return flashcardDeckStreamHandler(eventBus);
};
