import { z, parseParamsAs } from "@sidebase/nuxt-parse";
import type { Database } from "@/types/database";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default eventHandler(async (event) => {
  const { id } = parseParamsAs(event as any, paramsSchema);
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      message: "You must be logged in to perform this action",
      statusCode: 401,
    });
  }

  try {
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select()
      .eq("id", id)
      .single();

    if (fileError) throw fileError;
    if (!file) throw new Error("File not found");

    const { error } = await supabase.rpc("delete_file_and_documents", {
      file_id: id,
    });

    if (error) throw error;

    await supabase.storage.from("files").remove([`${user.id}/${file.name}`]);
    // #TODO: If this fails, we should probably rollback the database changes or we set up a cron job to clean up orphaned files
  } catch (error) {
    console.log(error);
    throw createError({
      message: "An error occurred while deleting your file",
      statusCode: 500,
    });
  }
});
