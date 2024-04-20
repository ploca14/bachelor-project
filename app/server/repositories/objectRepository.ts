import type { Security } from "~/server/tools/security";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "~/types/errors";

export interface ObjectRepository {
  getObjectByName: (name: string) => Promise<Blob>;
  remove: (name: string) => Promise<void>;
}

const STORAGE_BUCKET = "files";

export const supabaseObjectRepository = (
  security: Security,
  supabase: SupabaseClient,
): ObjectRepository => {
  const getObjectByName = async (name: string) => {
    const objectName = await getObjectName(name);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(objectName);

    if (error || !data) {
      throw new NotFoundError("File not found");
    }

    return data;
  };

  const remove = async (name: string) => {
    const objectName = await getObjectName(name);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([objectName]);

    if (error) {
      throw new NotFoundError("Failed to remove file");
    }
  };

  const getObjectName = async (name: string) => {
    const user = await security.getUser();

    return `${user.id}/${name}`;
  };

  return {
    getObjectByName,
    remove,
  };
};

import { useSecurity } from "~/server/tools/security";
import { useSupabaseClient } from "~/server/lib/supabase/client";

export const useObjectRepository = () => {
  const security = useSecurity();
  const supabase = useSupabaseClient();
  return supabaseObjectRepository(security, supabase);
};
