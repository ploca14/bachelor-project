import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";

const deleteFlashcardDeckCommandHandler = (
  flashcardDeckRepository: FlashcardDeckRepository,
) => {
  const execute = async (deckId: string) => {
    await flashcardDeckRepository.remove(deckId);
  };

  return { execute };
};

import { useFlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";

export const useDeleteFlashcardDeckCommandHandler = () => {
  const flashcardDeckRepository = useFlashcardDeckRepository();

  return deleteFlashcardDeckCommandHandler(flashcardDeckRepository);
};
