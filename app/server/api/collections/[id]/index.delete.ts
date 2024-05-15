import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useDeleteCollectionCommandHandler } from "~/server/handlers/command/deleteCollectionCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await security.checkCollectionOwnership(id);

    const { execute } = useDeleteCollectionCommandHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to delete collection.",
      });
    }

    throw error;
  }
});
