import { z } from "zod";
import { useValidatedParams, useValidatedBody } from "h3-zod";
import { useRenameCollectionCommandHandler } from "~/server/handlers/command/renameCollectionCommandHandler";
import { UnauthorizedError, NotFoundError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    const { name } = await useValidatedBody(event, {
      name: z.string(),
    });

    await security.checkCollectionOwnership(id);

    const { execute } = useRenameCollectionCommandHandler();

    return execute(id, name);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to rename collection.",
      });
    }

    throw error;
  }
});
