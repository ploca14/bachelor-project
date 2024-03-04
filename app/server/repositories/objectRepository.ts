import {
  useSecurityService,
  type SecurityService,
} from "~/server/services/securityService";
import { useSupabaseClient } from "~/server/lib/supabase/client";
import { NotFoundError } from "~/types/errors";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ObjectRepository {
  getObjectByName: (name: string) => Promise<Blob>;
  remove: (name: string) => Promise<void>;
}

const STORAGE_BUCKET = "files";

export const supabaseObjectRepository = (
  securityService: SecurityService,
  supabase: SupabaseClient,
): ObjectRepository => {
  const getObjectByName = async (name: string) => {
    const objectName = await getObjectName(name);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(objectName);

    if (error || !data) {
      console.log("error", error);
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
    const user = await securityService.getUser();

    return `${user.id}/${name}`;
  };

  return {
    getObjectByName,
    remove,
  };
};

export const useObjectRepository = () => {
  const securityService = useSecurityService();
  const supabase = useSupabaseClient();
  return supabaseObjectRepository(securityService, supabase);
};
