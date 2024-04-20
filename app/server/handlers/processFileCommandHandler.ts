import { File } from "~/server/domain/file";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { Security } from "~/server/tools/security";
import type { ObjectRepository } from "~/server/repositories/objectRepository";
import type { FileProcessor } from "~/server/tools/fileProcessor";

export interface ProcessFileCommandHandler {
  execute: (name: string, originalName: string) => Promise<void>;
}

export const processFileCommandHandler = (
  fileRepository: FileRepository,
  objectRepository: ObjectRepository,
  security: Security,
  fileProcessor: FileProcessor,
): ProcessFileCommandHandler => {
  const execute = async (name: string, originalName: string) => {
    const user = await security.getUser();

    const file = new File(name, originalName, user.id);
    const blob = await objectRepository.getObjectByName(file.name);

    await fileProcessor.processFile(file, blob);

    await fileRepository.save(file);
  };

  return { execute };
};

import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurity } from "~/server/tools/security";
import { useObjectRepository } from "~/server/repositories/objectRepository";
import { useFileProcessor } from "~/server/tools/fileProcessor";

export const useProcessFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const objectRepository = useObjectRepository();
  const security = useSecurity();
  const fileProcessor = useFileProcessor();

  return processFileCommandHandler(
    fileRepository,
    objectRepository,
    security,
    fileProcessor,
  );
};
