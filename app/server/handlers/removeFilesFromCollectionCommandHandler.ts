import { CollectionRepository } from "~/server/repositories/collectionRepository";

export interface RemoveFilesFromCollectionCommandHandler {
  execute: (collectionId: string, fileIds: string[]) => Promise<string>;
}

export const removeFilesFromCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
): RemoveFilesFromCollectionCommandHandler => {
  const execute = async (collectionId: string, fileIds: string[]) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    for (const fileId of fileIds) {
      collection.removeFile(fileId);
    }

    await collectionRepository.save(collection);

    return collectionId;
  };

  return {
    execute,
  };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";

export const useRemoveFilesFromCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();

  return removeFilesFromCollectionCommandHandler(collectionRepository);
};
