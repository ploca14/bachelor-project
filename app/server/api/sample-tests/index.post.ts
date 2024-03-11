import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useCreateSampleTestForFileCommandHandler } from "~/server/handlers/createSampleTestForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurityService } from "~/server/services/securityService";

export default defineEventHandler(async (event) => {
  try {
    const securityService = useSecurityService();

    const { fileId } = await useValidatedBody(event, {
      fileId: z.string(),
    });

    await securityService.checkFileOwnership(fileId);

    const { execute } = useCreateSampleTestForFileCommandHandler();

    const sampleTestId = await execute(fileId);

    return `http://localhost:3000/api/sample-tests/${sampleTestId}/stream`;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create a flashcard deck for file.",
      });
    }
  }
});
