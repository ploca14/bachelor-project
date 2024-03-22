import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardDeckDTO } from "~/server/dto/flashcardDeckDto";

const flashcardDeckQueryHandler = (
  securityService: SecurityService,
  kysely: KyselyClient,
) => {
  const execute = async (testId: string) => {
    const user = await securityService.getUser();

    const data: FlashcardDeckDTO = await kysely
      .selectFrom("flashcard_decks as fd")
      .select((eb) => [
        "id",
        "name",
        jsonArrayFrom(
          eb
            .selectFrom("flashcards as f")
            .select(["f.id", "f.front", "f.back"])
            .whereRef("f.deckId", "=", "fd.id"),
        ).as("flashcards"),
      ])
      .where("id", "=", testId)
      .where("userId", "=", user.id)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useFlashcardDeckQueryHandler = () => {
  const securityService = useSecurityService();
  const kyselyClient = useKyselyClient();

  return flashcardDeckQueryHandler(securityService, kyselyClient);
};
