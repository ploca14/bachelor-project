import { CollectionRepository } from "~/server/repositories/collectionRepository";

const deleteCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
) => {
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
