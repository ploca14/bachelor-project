import type { KyselyClient } from "~/server/lib/kysely/client";
import type { FileDTO } from "~/server/dto/fileDto";

export interface FilesQuery {
  execute: (userId: string) => Promise<FileDTO[]>;
}

const filesQuery = (kysely: KyselyClient): FilesQuery => {
  const execute = async (userId: string) => {
    const data: FileDTO[] = await kysely
      .selectFrom("files")
      .select([
        "files.id",
        "files.name",
        "files.originalName",
        "files.createdAt",
      ])
      .where("files.userId", "=", userId)
      .orderBy("createdAt", "desc")
      .orderBy("originalName", "asc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useFilesQuery = () => {
  const kysely = useKyselyClient();
  return filesQuery(kysely);
};
