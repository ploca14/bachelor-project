import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

export interface CreateFlashcardDeckForFileCommandHandler {
  execute: (fileId: string) => Promise<string>;
}

export const createFlashcardDeckForFileCommandHandler = (
  fileRepository: FileRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  securityService: SecurityService,
  flashcardGeneratorService: FlashcardGeneratorService,
  eventBus: EventBus,
): CreateFlashcardDeckForFileCommandHandler => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [fileId],
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
