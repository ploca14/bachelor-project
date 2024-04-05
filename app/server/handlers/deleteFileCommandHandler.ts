import type { FileRepository } from "~/server/repositories/fileRepository";
import type { ObjectRepository } from "~/server/repositories/objectRepository";

const deleteFileCommandHandler = (
  fileRepository: FileRepository,
  objectRepository: ObjectRepository,
) => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    await fileRepository.remove(fileId);
    await objectRepository.remove(file.name);
  };

  return { execute };
};

import { useFileRepository } from "~/server/repositories/fileRepository";
import { useObjectRepository } from "~/server/repositories/objectRepository";

export const useDeleteFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const objectRepository = useObjectRepository();

  return deleteFileCommandHandler(fileRepository, objectRepository);
};
