import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateConversationForFileCommandHandler } from "~/server/handlers/createConversationForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    const { execute } = useCreateConversationForFileCommandHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create conversation for file.",
      });
    }
  }
});
