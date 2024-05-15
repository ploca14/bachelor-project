import { useFlashcardDecksQueryHandler } from "~/server/handlers/query/flashcardDecksQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useFlashcardDecksQueryHandler();

  return execute();
});
