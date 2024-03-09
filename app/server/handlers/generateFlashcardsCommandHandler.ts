import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";

const generateFlashcardsCommandHandler = (
  flashcardDeckRepository: FlashcardDeckRepository,
  flashcardGeneratorService: FlashcardGeneratorService,
) => {
  const execute = async (deckId: string) => {
    const flashcardDeck =
      await flashcardDeckRepository.getFlashcardDeckById(deckId);

    const stream = await flashcardGeneratorService.generateFlashcards(
      flashcardDeck,
      {
        onEnd: async (flashcards) => {
          flashcardDeck.addFlashcards(flashcards.flat());
          await flashcardDeckRepository.save(flashcardDeck);
        },
      },
    );

    return stream;
  };

  return { execute };
};

import { useFlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import { useFlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";

export const useGenerateFlashcardsCommandHandler = () => {
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const flashcardGeneratorService = useFlashcardGeneratorService();

  return generateFlashcardsCommandHandler(
    flashcardDeckRepository,
    flashcardGeneratorService,
  );
};
