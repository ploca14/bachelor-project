import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import type { Embeddings } from "@langchain/core/embeddings";
import type { VectorStore } from "@langchain/core/vectorstores";

const supabaseVectorStore = (
  embeddings: Embeddings,
  client: SupabaseClient,
): VectorStore => {
  const store = new SupabaseVectorStore(embeddings, { client });

  return store;
};

import { useEmbeddingModel } from "~/server/lib/langchain/embeddingModel";
import { useSupabaseServiceClient } from "~/server/lib/supabase/client";

export const useVectorStore = singletonScope(() => {
  const embeddings = useEmbeddingModel();
  const client = useSupabaseServiceClient();

  return supabaseVectorStore(embeddings, client);
});