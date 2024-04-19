import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { flashcardMapper } from "~/server/mappers/flashcardMapper";

export const flashcardDeckMapper = {
  toDomain: (raw: any) => {
    return new FlashcardDeck(
      raw.name,
      raw.status,
      raw.files.map(({ fileId }: any) => fileId),
      raw.userId,
      raw.flashcards.map((flashcard: any) =>
        flashcardMapper.toDomain(flashcard),
      ),
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (flashcardDeck: FlashcardDeck) => {
    return {
      id: flashcardDeck.id,
      name: flashcardDeck.name,
      status: flashcardDeck.status,
      userId: flashcardDeck.userId,
      createdAt: flashcardDeck.createdAt,
    };
  },
};
