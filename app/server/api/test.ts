import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "../../types/database";

export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  $fetch("/api/hello");
});
