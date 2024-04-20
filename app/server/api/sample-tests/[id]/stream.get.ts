import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";
import { useSampleTestStreamHandler } from "~/server/handlers/sampleTestStreamHandler";

export default defineEventHandler(async (event) => {
  try {
    const eventStream = createEventStream(event);
    const security = useSecurity();

    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    await security.checkSampleTestOwnership(id);

    const { execute } = useSampleTestStreamHandler();

    await execute(id, {
      onProgress: (event) =>
        eventStream.push({
          event: "progress",
          data: JSON.stringify(event),
        }),
      onComplete: () =>
        eventStream.push({
          event: "complete",
          data: "",
        }),
      onError: (error) =>
        eventStream.push({
          event: "error",
          data: JSON.stringify(error),
        }),
    });

    return eventStream.send();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      console.error(error);
      throw createError({
        statusCode: 404,
        message: "Question deck not found.",
      });
    }

    throw error;
  }
});
