import { z } from "zod";
import { useValidatedParams } from "h3-zod";
import { useGenerateFlashcardsCommandHandler } from "~/server/handlers/generateFlashcardsCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  try {
    const eventStream = createEventStream(event);

    const { id } = await useValidatedParams(event, {
      id: z.coerce.string(),
    });

    // #TODO: Add precondition check to ensure that the user has access to the deck
    const { execute } = useGenerateFlashcardsCommandHandler();

    const stream = await execute(id);

    (async () => {
      for await (const data of stream) {
        await eventStream.push({ data: JSON.stringify(data) });
      }
      eventStream.close();
    })();

    eventStream.onClosed(async () => {
      await eventStream.close();
    });

    return eventStream.send();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Flashcard deck not found.",
      });
    }

    throw error;
  }
});
