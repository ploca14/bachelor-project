import { CollectionRepository } from "~/server/repositories/collectionRepository";

export interface RenameCollectionCommandHandler {
  execute: (collectionId: string, name: string) => Promise<string>;
}

const renameCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
): RenameCollectionCommandHandler => {
  const execute = async (collectionId: string, name: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    collection.name = name;

    await collectionRepository.save(collection);

    return collectionId;
  };

  return {
    execute,
  };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";

export const useRenameCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();

  return renameCollectionCommandHandler(collectionRepository);
};
