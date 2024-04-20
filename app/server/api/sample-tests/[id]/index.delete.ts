import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";
import { useDeleteSampleTestCommandHandler } from "~/server/handlers/deleteSampleTestCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await security.checkSampleTestOwnership(id);

    const { execute } = useDeleteSampleTestCommandHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to delete sample test.",
      });
    }

    throw error;
  }
});
