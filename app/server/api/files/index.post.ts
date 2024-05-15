import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useProcessFileCommandHandler } from "~/server/handlers/command/processFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { name, originalName } = await useValidatedBody(event, {
      name: z.string(),
      originalName: z.string(),
    });

    const { execute } = useProcessFileCommandHandler();

    return execute(name, originalName);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to process file.",
      });
    }

    throw error;
  }
});
