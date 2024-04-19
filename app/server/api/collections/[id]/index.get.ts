import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCollectionQueryHandler } from "~/server/handlers/collectionQueryHandler";
import { UnauthorizedError, NotFoundError } from "@/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { id: collectionId } = await useValidatedParams(event, {
      id: z.coerce.string().uuid(),
    });

    const { execute } = useCollectionQueryHandler();

    return execute(collectionId);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to load collection.",
      });
    }

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid collection ID.",
      });
    }

    throw error;
  }
});
