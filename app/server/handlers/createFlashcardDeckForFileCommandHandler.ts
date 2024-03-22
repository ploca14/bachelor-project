import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

const createFlashcardDeckForFileCommandHandler = (
  fileRepository: FileRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  securityService: SecurityService,
  flashcardGeneratorService: FlashcardGeneratorService,
  eventBus: EventBus,
) => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      [fileId],
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
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useFlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import { useEventBus } from "~/server/services/eventBus";

export const useCreateFlashcardDeckForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const securityService = useSecurityService();
  const flashcardGeneratorService = useFlashcardGeneratorService();
  const eventBus = useEventBus();

  return createFlashcardDeckForFileCommandHandler(
    fileRepository,
    flashcardDeckRepository,
    securityService,
    flashcardGeneratorService,
    eventBus,
  );
};
