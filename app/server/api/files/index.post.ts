import { z, parseBodyAs } from "@sidebase/nuxt-parse";

import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { authedHandler } from "~/server/utils/authedHandler";

const bodySchema = z.object({
  file: z.object({
    id: z.string(),
    name: z.string(),
    original_name: z.string(),
  }),
});

export default authedHandler(async (event) => {
  const { file } = await parseBodyAs(event as any, bodySchema);
  const { user, supabase } = event.context;

  // Add a row to the files table
  const { data: fileRow, error: insertError } = await supabase
    .from("files")
    .insert({
      name: file.name,
      original_name: file.original_name,
    })
    .select()
    .single();

  if (insertError) {
    throw createError({
      message: "An error occurred while processing your file",
      statusCode: 500,
    });
  }

  try {
    // Download the file from storage
    const { data, error: storageError } = await supabase.storage
      .from("files")
      .download(`${user.id}/${file.name}`);

    if (storageError) throw storageError;

    // Load the file into a vector store
    const loader = new WebPDFLoader(data);

    const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client: supabase,
      tableName: "documents",
      queryName: "match_documents",
    });

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

    const rawDocs = await loader.load();
    const docs = await splitter.splitDocuments(rawDocs);
    const docsWithMetadata = docs.map((doc) => {
      return {
        ...doc,
        metadata: {
          ...doc.metadata,
          user_id: user?.id,
          file_id: fileRow.id,
        },
      };
    });

    await vectorStore.addDocuments(docsWithMetadata);

    const { error: commitError } = await supabase
      .from("files")
      .update({ status: "PROCESSED" })
      .eq("id", fileRow.id);

    if (commitError) throw commitError;
  } catch (error) {
    console.log(error);
    const { error: rollbackError } = await supabase
      .from("files")
      .update({ status: "FAILED" })
      .eq("id", fileRow.id);

    if (rollbackError) {
      console.error(rollbackError);
    }

    throw createError({
      message: "An error occurred while processing your file",
      statusCode: 500,
    });
  }
});
