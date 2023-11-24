import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "../../types/database";

export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  (async () => {
    const client = await serverSupabaseClient<Database>(event);
    console.log("starting");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log("progress");
    await new Promise((resolve) => setTimeout(resolve, 25000));
    console.log("done");
    client.from("documents").insert({ id: Math.random(), content: "test" });
  })();
});
