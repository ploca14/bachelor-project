import type { FlashcardDeckQuery } from "~/server/queries/flashcardDeckQuery";
import type { Security } from "~/server/tools/security";
import type { FlashcardDeckDTO } from "~/server/dto/flashcardDeckDto";

export interface FlashcardDeckQueryHandler {
  execute: (testId: string) => Promise<FlashcardDeckDTO>;
}

const flashcardDeckQueryHandler = (
  security: Security,
  flashcardDeckQuery: FlashcardDeckQuery,
): FlashcardDeckQueryHandler => {
  const execute = async (testId: string) => {
    const user = await security.getUser();

    return flashcardDeckQuery.execute(testId, user.id);
  };

  return { execute };
};

/* v8 ignore start */
import { useSecurity } from "~/server/tools/security";
import { useFlashcardDeckQuery } from "~/server/queries/flashcardDeckQuery";

export const useFlashcardDeckQueryHandler = () => {
  const security = useSecurity();
  const flashcardDeckQuery = useFlashcardDeckQuery();

  return flashcardDeckQueryHandler(security, flashcardDeckQuery);
};
