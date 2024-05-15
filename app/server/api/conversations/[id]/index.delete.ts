import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useDeleteConversationCommandHandler } from "~/server/handlers/command/deleteConversationCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await security.checkConversationOwnership(id);

    const { execute } = useDeleteConversationCommandHandler();

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
