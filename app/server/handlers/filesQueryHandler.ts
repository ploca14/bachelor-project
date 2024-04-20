import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { FileDTO } from "~/server/dto/fileDto";

export interface FilesQueryHandler {
  execute: () => Promise<FileDTO[]>;
}

const filesQueryHandler = (
  kysely: KyselyClient,
  security: Security,
): FilesQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    const data: FileDTO[] = await kysely
      .selectFrom("files")
      .select([
        "files.id",
        "files.name",
        "files.originalName",
        "files.createdAt",
      ])
      .where("files.userId", "=", user.id)
      .orderBy("createdAt", "desc")
      .orderBy("originalName", "asc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurity } from "~/server/tools/security";

export const useFilesQueryHandler = () => {
  const security = useSecurity();
  const kysely = useKyselyClient();
  return filesQueryHandler(kysely, security);
};
