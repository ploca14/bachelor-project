import { z } from "zod";
import { useValidatedParams, useValidatedBody } from "h3-zod";
import { useAddFilesToCollectionCommandHandler } from "~/server/handlers/command/addFilesToCollectionCommandHandler";
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
    await Promise.all(fileIds.map(security.checkFileOwnership));

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
