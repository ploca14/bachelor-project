import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";
import { useSendMessageToConversationCommandHandler } from "~/server/handlers/command/sendMessageToConversationCommandHandler";
import {
  UnauthorizedError,
  NotFoundError,
  InvalidMessageError,
  ConversationDisabledError,
} from "~/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    const { content } = await useValidatedBody(event, {
      content: z.string(),
    });

    const { execute } = useSendMessageToConversationCommandHandler();

    return execute(id, content);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to load conversation.",
      });
    }

    if (
      error instanceof InvalidMessageError ||
      error instanceof ConversationDisabledError
    ) {
      throw createError({
        statusCode: 400,
        message: error.message,
      });
    }

    throw error;
  }
});
