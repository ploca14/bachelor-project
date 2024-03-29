import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateSampleTestForCollectionCommandHandler } from "~/server/handlers/createSampleTestForCollectionCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await securityService.checkCollectionOwnership(id);

    const { execute } = useCreateSampleTestForCollectionCommandHandler();

    const sampleTestId = await execute(id);

    return sampleTestId;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create a flashcard deck for collection.",
      });
    }
  }
});
