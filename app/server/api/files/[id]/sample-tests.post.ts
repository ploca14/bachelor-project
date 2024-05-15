import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useCreateSampleTestForFileCommandHandler } from "~/server/handlers/command/createSampleTestForFileCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    setResponseStatus(event, 202);
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.string(),
    });

    await security.checkFileOwnership(id);

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
