import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useConversationQueryHandler } from "~/server/handlers/conversationQueryHandler";
import { UnauthorizedError, NotFoundError } from "@/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { id: conversationId } = await useValidatedParams(event, {
      id: z.coerce.string().uuid(),
    });

    const { execute } = useConversationQueryHandler();

    return execute(conversationId);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to load conversation.",
      });
    }

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid conversation ID.",
      });
    }

    throw error;
  }
});
