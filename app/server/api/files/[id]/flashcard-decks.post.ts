import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateFlashcardDeckForFileCommandHandler } from "~/server/handlers/command/createFlashcardDeckForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await security.checkFileOwnership(id);

    const { execute } = useCreateFlashcardDeckForFileCommandHandler();

    const flashcardDeckId = await execute(id);

    setResponseStatus(event, 202);

    return flashcardDeckId;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create a flashcard deck for file.",
      });
    }
  }
});
