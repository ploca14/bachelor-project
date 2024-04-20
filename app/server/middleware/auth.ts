import { useSecurity } from "~/server/tools/security";
import { UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api")) {
    try {
      const security = useSecurity();

      const user = await security.getUser();

      if (!user) {
        throw new UnauthorizedError("Unauthorized");
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw createError({
          statusCode: 401,
          message: "Unauthorized",
        });
      }

      throw createError({
        statusCode: 500,
        message: "Failed to connect to Supabase",
      });
    }
  }
});
