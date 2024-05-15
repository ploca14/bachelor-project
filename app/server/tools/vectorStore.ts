import { SupabaseClient } from "@supabase/supabase-js";

export interface VectorStore {
  getDocuments: (fileIds: string[]) => Promise<
    {
      pageContent: string;
      metadata: Record<string, any>;
    }[]
  >;
}

const supabaseVectorStore = (supabase: SupabaseClient): VectorStore => {
  const getDocuments = async (fileIds: string[]) => {
    const { data, error } = await supabase
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
/* v8 ignore start */
import { useSupabaseClient } from "~/server/lib/supabase/client";

export const useVectorStore = () => {
  const supabaseClient = useSupabaseClient();

  return supabaseVectorStore(supabaseClient);
};
