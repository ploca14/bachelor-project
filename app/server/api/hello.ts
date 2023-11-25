import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "../../types/database";

export default defineEventHandler(async (event) => {
  // Create a stream that allows writing
  const { writable, readable } = new TransformStream();
  sendStream(event, readable);
  const writer = writable.getWriter();
  const encoder = new TextEncoder("utf-8");

  const client = await serverSupabaseClient<Database>(event);
  writer.write(encoder.encode("0.25"));

  await new Promise((resolve) => setTimeout(resolve, 10000));
  writer.write(encoder.encode("0.5"));
  await new Promise((resolve) => setTimeout(resolve, 25000));
  writer.write(encoder.encode("0.75"));

  await client
    .from("documents")
    .insert({ id: Math.floor(Math.random() * 1000000), content: "test" });
  writer.write(encoder.encode("1"));

  writer.close(); // This signals the end of the stream
});
