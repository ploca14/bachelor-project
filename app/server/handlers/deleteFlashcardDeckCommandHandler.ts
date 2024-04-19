import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";

export interface DeleteFlashcardDeckCommandHandler {
  execute: (deckId: string) => Promise<void>;
}

const deleteFlashcardDeckCommandHandler = (
  flashcardDeckRepository: FlashcardDeckRepository,
): DeleteFlashcardDeckCommandHandler => {
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
