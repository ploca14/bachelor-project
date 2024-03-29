import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useDeleteFileCommandHandler } from "~/server/handlers/deleteFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const { fileIds } = await useValidatedBody(event, {
      fileIds: z.array(z.string()),
    });

    const { execute } = useDeleteFileCommandHandler();

    return Promise.all(fileIds.map((id) => execute(id)));
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to delete file.",
      });
    }

    throw error;
  }
});
