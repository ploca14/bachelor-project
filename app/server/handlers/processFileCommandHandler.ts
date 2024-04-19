import { File } from "~/server/domain/file";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { ObjectRepository } from "~/server/repositories/objectRepository";
import type { FileProcessorService } from "~/server/services/fileProcessorService";

export interface ProcessFileCommandHandler {
  execute: (name: string, originalName: string) => Promise<void>;
}

export const processFileCommandHandler = (
  fileRepository: FileRepository,
  objectRepository: ObjectRepository,
  securityService: SecurityService,
  fileProcessorService: FileProcessorService,
): ProcessFileCommandHandler => {
  const execute = async (name: string, originalName: string) => {
    const user = await securityService.getUser();

    const file = new File(name, originalName, user.id);
    const blob = await objectRepository.getObjectByName(file.name);

    await fileProcessorService.processFile(file, blob);

    await fileRepository.save(file);
  };

  return { execute };
};

import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useObjectRepository } from "~/server/repositories/objectRepository";
import { useFileProcessorService } from "~/server/services/fileProcessorService";

export const useProcessFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const objectRepository = useObjectRepository();
  const securityService = useSecurityService();
  const fileProcessorService = useFileProcessorService();

  return processFileCommandHandler(
    fileRepository,
    objectRepository,
    securityService,
    fileProcessorService,
  );
};
