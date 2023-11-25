import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "../../types/database";

export default defineEventHandler(async (event) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const write = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      };

      const client = await serverSupabaseClient<Database>(event);
      write("0.25");

      await new Promise((resolve) => setTimeout(resolve, 5000));
      write("0.5");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      write("0.75");

      await client
        .from("documents")
        .insert({ id: Math.floor(Math.random() * 1000000), content: "test" });

      write("1");

      controller.close();
    },
  });

  return stream;
});
