import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardDeckListItemDTO } from "~/server/dto/flashcardDeckListItemDto";

const flashcardDecksQueryHandler = (
  kysely: KyselyClient,
  securityService: SecurityService,
) => {
  const execute = async () => {
    const user = await securityService.getUser();

    const data: FlashcardDeckListItemDTO[] = await kysely
      .selectFrom("flashcard_decks as fd")
      .select(["fd.id", "fd.name", "fd.createdAt"])
      .where("fd.userId", "=", user.id)
      .orderBy("fd.createdAt", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useFlashcardDecksQueryHandler = () => {
  const kysely = useKyselyClient();
  const securityService = useSecurityService();

  return flashcardDecksQueryHandler(kysely, securityService);
};
