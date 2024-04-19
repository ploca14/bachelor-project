import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { FileDTO } from "~/server/dto/fileDto";

export interface FilesQueryHandler {
  execute: () => Promise<FileDTO[]>;
}

const filesQueryHandler = (
  kysely: KyselyClient,
  securityService: SecurityService,
): FilesQueryHandler => {
  const execute = async () => {
    const user = await securityService.getUser();

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
import { useSecurityService } from "~/server/services/securityService";

export const useFilesQueryHandler = () => {
  const securityService = useSecurityService();
  const kysely = useKyselyClient();
  return filesQueryHandler(kysely, securityService);
};
