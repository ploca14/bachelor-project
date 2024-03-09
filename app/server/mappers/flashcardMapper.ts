import { Flashcard } from "~/server/domain/flashcard";

export const flashcardMapper = {
  toDomain: (raw: any) => {
    return new Flashcard(
      raw.front,
      raw.back,
      raw.deckId,
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (flashcard: Flashcard) => {
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      createdAt: flashcard.createdAt,
      deckId: flashcard.deckId,
    };
  },
};
