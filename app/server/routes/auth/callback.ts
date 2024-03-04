import { useSupabaseClient } from "~/server/lib/supabase/client";
import { useValidatedQuery } from "h3-zod";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseClient();
  const { code, next } = await useValidatedQuery(event, {
    code: z.string(),
    next: z.string().optional().default("/"),
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  return sendRedirect(event, next, 302);
});
