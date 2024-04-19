import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

export interface CreateFlashcardDeckForCollectionCommandHandler {
  execute: (collectionId: string) => Promise<string>;
}

export const createFlashcardDeckForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  securityService: SecurityService,
  flashcardGeneratorService: FlashcardGeneratorService,
  eventBus: EventBus,
): CreateFlashcardDeckForCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await securityService.getUser();
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
    );

    await flashcardDeckRepository.save(flashcardDeck);

    flashcardGeneratorService.generateFlashcards(flashcardDeck, {
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
import { useSecurityService } from "~/server/services/securityService";
import { useFlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import { useEventBus } from "~/server/services/eventBus";

export const useCreateFlashcardDeckForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const securityService = useSecurityService();
  const flashcardGeneratorService = useFlashcardGeneratorService();
  const eventBus = useEventBus();

  return createFlashcardDeckForCollectionCommandHandler(
    collectionRepository,
    flashcardDeckRepository,
    securityService,
    flashcardGeneratorService,
    eventBus,
  );
};
