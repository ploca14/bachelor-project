import { CollectionRepository } from "~/server/repositories/collectionRepository";

const addFilesToCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
) => {
  const execute = async (collectionId: string, fileIds: string[]) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    for (const fileId of fileIds) {
      if (!collection.fileIds.includes(fileId)) {
        collection.addFile(fileId);
      }
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