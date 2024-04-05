import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useDeleteFileCommandHandler } from "~/server/handlers/deleteFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { fileIds } = await useValidatedBody(event, {
      fileIds: z.array(z.string()),
    });

    await Promise.all(
      fileIds.map((id) => securityService.checkFileOwnership(id)),
    );

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
