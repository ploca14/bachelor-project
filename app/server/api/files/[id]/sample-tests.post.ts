import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateSampleTestForFileCommandHandler } from "~/server/handlers/createSampleTestForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await securityService.checkFileOwnership(id);

    const { execute } = useCreateSampleTestForFileCommandHandler();

    const testId = await execute(id);

    return testId;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create a flashcard deck for file.",
      });
    }
  }
});
