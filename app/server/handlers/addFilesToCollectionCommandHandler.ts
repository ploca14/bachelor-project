import { CollectionRepository } from "~/server/repositories/collectionRepository";

export interface AddFilesToCollectionCommandHandler {
  execute: (collectionId: string, fileIds: string[]) => Promise<string>;
}

export const addFilesToCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
): AddFilesToCollectionCommandHandler => {
  const execute = async (collectionId: string, fileIds: string[]) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    for (const fileId of fileIds) {
      collection.addFile(fileId);
    }

    await collectionRepository.save(collection);

    return collectionId;
  };

  return {
    execute,
  };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";

export const useAddFilesToCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();

  return addFilesToCollectionCommandHandler(collectionRepository);
};
