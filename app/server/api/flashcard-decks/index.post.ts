import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useCreateFlashcardDeckForFileCommandHandler } from "~/server/handlers/createFlashcardDeckForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { fileId } = await useValidatedBody(event, {
      fileId: z.string(),
    });

    await securityService.checkFileOwnership(fileId);

    const { execute } = useCreateFlashcardDeckForFileCommandHandler();

    const flashcardDeckId = await execute(fileId);

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
