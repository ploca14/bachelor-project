import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { FlashcardDeckListItemDTO } from "~/server/dto/flashcardDeckListItemDto";

export interface FlashcardDecksQueryHandler {
  execute: () => Promise<FlashcardDeckListItemDTO[]>;
}

const flashcardDecksQueryHandler = (
  kysely: KyselyClient,
  security: Security,
): FlashcardDecksQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

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
import { useSecurity } from "~/server/tools/security";

export const useFlashcardDecksQueryHandler = () => {
  const kysely = useKyselyClient();
  const security = useSecurity();

  return flashcardDecksQueryHandler(kysely, security);
};
