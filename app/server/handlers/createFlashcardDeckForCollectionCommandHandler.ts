import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

const createFlashcardDeckForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  securityService: SecurityService,
  flashcardGeneratorService: FlashcardGeneratorService,
  eventBus: EventBus,
) => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await securityService.getUser();
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      collection.fileIds,
      user.id,
    );

    await flashcardDeckRepository.save(flashcardDeck);

    flashcardGeneratorService.generateFlashcards(flashcardDeck, {
      onProgress: async (progress) => {
        await eventBus.publish(
          `flashcardDeck:${flashcardDeck.id}:progress`,
          progress,
        );
      },
      onSuccess: async (flashcards) => {
        flashcardDeck.addFlashcards(flashcards);
        await flashcardDeckRepository.save(flashcardDeck);
        await eventBus.publish(`flashcardDeck:${flashcardDeck.id}:complete`);
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
