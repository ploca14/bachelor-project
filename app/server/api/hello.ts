import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "../../types/database";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  // Generate a random id, it has to be an integer
  const { data, error } = await client
    .from("documents")
    .insert({ id: Math.floor(Math.random() * 1000000), content: "test" });

  return {
    data,
    error,
  };
});
