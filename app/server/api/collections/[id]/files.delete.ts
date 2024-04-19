import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";
import { useRemoveFilesFromCollectionCommandHandler } from "~/server/handlers/removeFilesFromCollectionCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    const { fileIds } = await useValidatedBody(event, {
      fileIds: z.array(z.string()),
    });

    await securityService.checkCollectionOwnership(id);

    const { execute } = useRemoveFilesFromCollectionCommandHandler();

    const collectionId = await execute(id, fileIds);

    return collectionId;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to remove file from collection.",
      });
    }

    throw error;
  }
});
