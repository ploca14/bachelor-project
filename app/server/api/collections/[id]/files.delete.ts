import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";
import { useRemoveFilesFromCollectionCommandHandler } from "~/server/handlers/command/removeFilesFromCollectionCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    const { fileIds } = await useValidatedBody(event, {
      fileIds: z.array(z.string()),
    });

    await security.checkCollectionOwnership(id);

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
