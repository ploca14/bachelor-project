import type { Security } from "~/server/tools/security";
import { FlashcardDecksQuery } from "~/server/queries/flashcardDecksQuery";
import type { FlashcardDeckListItemDTO } from "~/server/dto/flashcardDeckListItemDto";

export interface FlashcardDecksQueryHandler {
  execute: () => Promise<FlashcardDeckListItemDTO[]>;
}

const flashcardDecksQueryHandler = (
  security: Security,
  flashcardDecksQuery: FlashcardDecksQuery,
): FlashcardDecksQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    return flashcardDecksQuery.execute(user.id);
  };

  return { execute };
};

/* v8 ignore start */
import { useSecurity } from "~/server/tools/security";
import { useFlashcardDecksQuery } from "~/server/queries/flashcardDecksQuery";

export const useFlashcardDecksQueryHandler = () => {
  const security = useSecurity();
  const flashcardDecksQuery = useFlashcardDecksQuery();

  return flashcardDecksQueryHandler(security, flashcardDecksQuery);
};
