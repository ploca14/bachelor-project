import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateConversationForCollectionCommandHandler } from "~/server/handlers/createConversationForCollectionCommandHandler";
import { NoFilesError, NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    await securityService.checkCollectionOwnership(id);

    const { execute } = useCreateConversationForCollectionCommandHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create conversation for file.",
      });
    }

    if (error instanceof NoFilesError) {
      throw createError({
        statusCode: 400,
        message: "A conversation must have at least one file",
      });
    }

    throw error;
  }
});
