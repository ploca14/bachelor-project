import { z } from "zod";
import { useValidatedParams, useValidatedBody } from "h3-zod";
import { useAddFilesToCollectionCommandHandler } from "~/server/handlers/addFilesToCollectionCommandHandler";
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
    await Promise.all(fileIds.map(securityService.checkFileOwnership));

    const { execute } = useAddFilesToCollectionCommandHandler();

    return execute(id, fileIds);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to add file to collection.",
      });
    }

    throw error;
  }
});
