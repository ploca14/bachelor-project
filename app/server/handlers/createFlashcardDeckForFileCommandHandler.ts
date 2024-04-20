import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { Security } from "~/server/tools/security";
import type { FlashcardGenerator } from "~/server/tools/flashcardGenerator";
import type { EventBus } from "~/server/tools/eventBus";

export interface CreateFlashcardDeckForFileCommandHandler {
  execute: (fileId: string) => Promise<string>;
}

export const createFlashcardDeckForFileCommandHandler = (
  fileRepository: FileRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  security: Security,
  flashcardGenerator: FlashcardGenerator,
  eventBus: EventBus,
): CreateFlashcardDeckForFileCommandHandler => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await security.getUser();
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [fileId],
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
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurity } from "~/server/tools/security";
import { useFlashcardGenerator } from "~/server/tools/flashcardGenerator";
import { useEventBus } from "~/server/tools/eventBus";

export const useCreateFlashcardDeckForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const security = useSecurity();
  const flashcardGenerator = useFlashcardGenerator();
  const eventBus = useEventBus();

  return createFlashcardDeckForFileCommandHandler(
    fileRepository,
    flashcardDeckRepository,
    security,
    flashcardGenerator,
    eventBus,
  );
};
