import type { KyselyClient } from "~/server/lib/kysely/client";
import type { FlashcardDeckListItemDTO } from "~/server/dto/flashcardDeckListItemDto";

export interface FlashcardDecksQuery {
  execute: (userId: string) => Promise<FlashcardDeckListItemDTO[]>;
}

const flashcardDecksQuery = (kysely: KyselyClient): FlashcardDecksQuery => {
  const execute = async (userId: string) => {
    const data: FlashcardDeckListItemDTO[] = await kysely
      .selectFrom("flashcard_decks as fd")
      .select(["fd.id", "fd.name", "fd.createdAt"])
      .where("fd.userId", "=", userId)
      .orderBy("fd.createdAt", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useFlashcardDecksQuery = () => {
  const kysely = useKyselyClient();

  return flashcardDecksQuery(kysely);
};
