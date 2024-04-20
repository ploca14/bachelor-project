import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { useCreateCollectionCommandHandler } from "~/server/handlers/createCollectionCommandHandler";
import { NotFoundError, UnauthorizedError } from "~/types/errors";
import { useSecurity } from "~/server/tools/security";

export default defineEventHandler(async (event) => {
  try {
    const security = useSecurity();

    const { name, fileIds } = await useValidatedBody(event, {
      name: z.string(),
      fileIds: z.array(z.string()),
    });

    await Promise.all(fileIds.map(security.checkFileOwnership));

    const { execute } = useCreateCollectionCommandHandler();

    const collectionId = await execute(name, fileIds);

    return collectionId;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw createError({
        statusCode: 404,
        message: "Unable to create collection.",
      });
    }

    throw error;
  }
});
