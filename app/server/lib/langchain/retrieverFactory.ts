import { SupabaseFilterRPCCall } from "@langchain/community/vectorstores/supabase";
import { Conversation } from "~/server/domain/conversation";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import type { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import type { MemoryVectorStore } from "langchain/vectorstores/memory";

export interface RetrieverFactory {
  createForConversation: (
    conversation: Conversation,
    k: number,
  ) => VectorStoreRetriever;
}

export const supabaseRetrieverFactory = (
  store: SupabaseVectorStore,
): RetrieverFactory => {
  const createForConversation = (conversation: Conversation, k: number) => {
    const filter: SupabaseFilterRPCCall = (rpc) => {
      return rpc
        .in("metadata->>file_id", conversation.fileIds)
        .eq("metadata->>user_id", conversation.userId);
    };

    const retriever = store.asRetriever({
      k,
      filter,
    });

    return retriever;
  };

  return { createForConversation };
};

import { supabaseVectorStore } from "~/server/lib/langchain/vectorStore";
import { useEmbeddingModel } from "~/server/lib/langchain/embeddingModel";
import { useSupabaseServiceClient } from "~/server/lib/supabase/client";

export const useRetrieverFactory = () => {
  const embeddings = useEmbeddingModel();
  const client = useSupabaseServiceClient();
  const store = supabaseVectorStore(embeddings, client);

  return supabaseRetrieverFactory(store);
};
