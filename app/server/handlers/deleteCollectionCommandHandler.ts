import { CollectionRepository } from "~/server/repositories/collectionRepository";

export interface DeleteCollectionCommandHandler {
  execute: (collectionId: string) => Promise<void>;
}

const deleteCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
): DeleteCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    await collectionRepository.remove(collectionId);
  };

  return {
    execute,
  };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";

export const useDeleteCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();

  return deleteCollectionCommandHandler(collectionRepository);
};
