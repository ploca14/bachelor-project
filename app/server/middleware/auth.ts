import { useSecurityService } from "~/server/services/securityService";
import { UnauthorizedError } from "~/types/errors";

export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api")) {
    try {
      const securityService = useSecurityService();

      // const user = await securityService.getUser();

      // if (!user) {
      //   throw new UnauthorizedError("Unauthorized");
      // }
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
