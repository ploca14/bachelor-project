import { SupabaseClient } from "@supabase/supabase-js";

export interface VectorStoreService {
  getDocuments: (fileIds: string[]) => Promise<
    {
      pageContent: string;
      metadata: Record<string, any>;
    }[]
  >;
}

const supabaseVectorStoreService = (
  supabaseClient: SupabaseClient,
): VectorStoreService => {
  const getDocuments = async (fileIds: string[]) => {
    const { data, error } = await supabaseClient
      .from("documents")
      .select("pageContent:content, metadata")
      .in("metadata->>file_id", fileIds);

    if (error) {
      throw error;
    }

    return data;
  };

  return { getDocuments };
};

import { useSupabaseServiceClient } from "~/server/lib/supabase/client";

export const useVectorStoreService = () => {
  const supabaseClient = useSupabaseServiceClient();

  return supabaseVectorStoreService(supabaseClient);
};
