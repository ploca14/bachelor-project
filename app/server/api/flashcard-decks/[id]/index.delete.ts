import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useDeleteFlashcardDeckCommandHandler } from "~/server/handlers/deleteFlashcardDeckCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await securityService.checkFlashcardDeckOwnership(id);

    const { execute } = useDeleteFlashcardDeckCommandHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to delete flashcard deck.",
      });
    }

    throw error;
  }
});
