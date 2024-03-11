import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useSampleTestQueryHandler } from "~/server/handlers/sampleTestQueryHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    await securityService.checkSampleTestOwnership(id);

    const { execute } = useSampleTestQueryHandler();

    return execute(id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Question deck not found.",
      });
    }

    throw error;
  }
});
