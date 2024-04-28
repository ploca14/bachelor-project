import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { FlashcardDeckDTO } from "~/server/dto/flashcardDeckDto";

export interface FlashcardDeckQuery {
  execute: (testId: string, userId: string) => Promise<FlashcardDeckDTO>;
}

const flashcardDeckQuery = (kysely: KyselyClient): FlashcardDeckQuery => {
  const execute = async (testId: string, userId: string) => {
    const data: FlashcardDeckDTO = await kysely
      .selectFrom("flashcard_decks as fd")
      .select((eb) => [
        "id",
        "name",
        "status",
        jsonArrayFrom(
          eb
            .selectFrom("flashcards as f")
            .select(["f.id", "f.front", "f.back"])
            .whereRef("f.deckId", "=", "fd.id"),
        ).as("flashcards"),
      ])
      .where("id", "=", testId)
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useFlashcardDeckQuery = () => {
  const kyselyClient = useKyselyClient();

  return flashcardDeckQuery(kyselyClient);
};
