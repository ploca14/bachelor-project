import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { ObjectRepository } from "~/server/repositories/objectRepository";

const deleteFileCommandHandler = (
  fileRepository: FileRepository,
  objectRepository: ObjectRepository,
  securityService: SecurityService,
) => {
  const execute = async (fileId: string) => {
    // TODO: Move to controller
    await securityService.checkFileOwnership(fileId);

    const file = await fileRepository.getFileById(fileId);

    await fileRepository.remove(fileId);
    await objectRepository.remove(file.name);
  };

  return { execute };
};

import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useObjectRepository } from "~/server/repositories/objectRepository";

export const useDeleteFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const objectRepository = useObjectRepository();
  const securityService = useSecurityService();

  return deleteFileCommandHandler(
    fileRepository,
    objectRepository,
    securityService,
  );
};
