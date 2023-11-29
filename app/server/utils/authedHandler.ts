import type { EventHandler, EventHandlerRequest } from "h3";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

declare module "h3" {
  interface H3EventContext {
    user: User;
    supabase: SupabaseClient<Database>;
  }
}

export const authedHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> => {
  return defineEventHandler<T>(async (event) => {
    const user = await serverSupabaseUser(event);
    const supabase = await serverSupabaseClient(event);

    if (!user) {
      throw createError({
        message: "You must be logged in to perform this action",
        statusCode: 401,
      });
    }

    event.context.user = user;
    event.context.supabase = supabase;

    const response = await handler(event);
    return { response };
  });
};
