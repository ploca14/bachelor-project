import { useFlashcardDecksQueryHandler } from "~/server/handlers/flashcardDecksQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useFlashcardDecksQueryHandler();

  return execute();
});
