import { SupabaseFilterRPCCall } from "@langchain/community/vectorstores/supabase";
import { Conversation } from "~/server/domain/conversation";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";

export interface RetrieverFilterFactory {
  createForConversation: (
    conversation: Conversation,
  ) => VectorStoreRetriever["filter"];
}

export const supabaseRetrieverFilterFactory = (): RetrieverFilterFactory => {
  const createForConversation = (conversation: Conversation) => {
    const filter: SupabaseFilterRPCCall = (rpc) => {
      return rpc
        .in("metadata->>file_id", conversation.fileIds)
        .eq("metadata->>user_id", conversation.userId);
    };

    return filter;
  };

  return { createForConversation };
};

export const useRetrieverFilterFactory = () => {
  return supabaseRetrieverFilterFactory();
};
