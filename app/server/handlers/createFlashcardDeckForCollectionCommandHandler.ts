import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { Security } from "~/server/tools/security";
import type { FlashcardGenerator } from "~/server/tools/flashcardGenerator";
import type { EventBus } from "~/server/tools/eventBus";

export interface CreateFlashcardDeckForCollectionCommandHandler {
  execute: (collectionId: string) => Promise<string>;
}

export const createFlashcardDeckForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  security: Security,
  flashcardGenerator: FlashcardGenerator,
  eventBus: EventBus,
): CreateFlashcardDeckForCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await security.getUser();
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
    );

    await flashcardDeckRepository.save(flashcardDeck);

    flashcardGenerator.generateFlashcards(flashcardDeck, {
      async onProgress(progress) {
        await eventBus.publish(
          `flashcardDeck:${flashcardDeck.id}:progress`,
          progress,
        );
      },
      async onSuccess(flashcards) {
        flashcardDeck.addFlashcards(flashcards);
        flashcardDeck.status = "complete";
        await flashcardDeckRepository.save(flashcardDeck);
        await eventBus.publish(`flashcardDeck:${flashcardDeck.id}:complete`);
      },
      async onError(error) {
        flashcardDeck.status = "error";
        await flashcardDeckRepository.save(flashcardDeck);
        await eventBus.publish(
          `flashcardDeck:${flashcardDeck.id}:error`,
          error.message,
        );
      },
    });

    return flashcardDeck.id;
  };

  return { execute };
};

import { useFlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurity } from "~/server/tools/security";
import { useFlashcardGenerator } from "~/server/tools/flashcardGenerator";
import { useEventBus } from "~/server/tools/eventBus";

export const useCreateFlashcardDeckForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const security = useSecurity();
  const flashcardGenerator = useFlashcardGenerator();
  const eventBus = useEventBus();

  return createFlashcardDeckForCollectionCommandHandler(
    collectionRepository,
    flashcardDeckRepository,
    security,
    flashcardGenerator,
    eventBus,
  );
};
