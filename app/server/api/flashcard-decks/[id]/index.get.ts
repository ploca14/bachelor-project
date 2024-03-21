import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useFlashcardDeckQueryHandler } from "~/server/handlers/flashcardDeckQueryHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    await securityService.checkFlashcardDeckOwnership(id);

    const { execute } = useFlashcardDeckQueryHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Flashcard deck not found.",
      });
    }

    throw error;
  }
});
