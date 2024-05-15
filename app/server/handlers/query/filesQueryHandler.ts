import type { FilesQuery } from "~/server/queries/filesQuery";
import type { Security } from "~/server/tools/security";
import type { FileDTO } from "~/server/dto/fileDto";

export interface FilesQueryHandler {
  execute: () => Promise<FileDTO[]>;
}

const filesQueryHandler = (
  security: Security,
  filesQuery: FilesQuery,
): FilesQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    return filesQuery.execute(user.id);
  };

  return { execute };
};

/* v8 ignore start */
import { useSecurity } from "~/server/tools/security";
import { useFilesQuery } from "~/server/queries/filesQuery";

export const useFilesQueryHandler = () => {
  const security = useSecurity();
  const filesQuery = useFilesQuery();

  return filesQueryHandler(security, filesQuery);
};
