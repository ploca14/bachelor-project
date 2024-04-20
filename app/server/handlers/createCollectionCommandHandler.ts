import { Collection } from "~/server/domain/collection";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { Security } from "~/server/tools/security";

export interface CreateCollectionCommandHandler {
  execute: (name: string, fileIds: string[]) => Promise<string>;
}

export const createCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  security: Security,
): CreateCollectionCommandHandler => {
  const execute = async (name: string, fileIds: string[]) => {
    const user = await security.getUser();

    const collection = new Collection(name, fileIds, user.id);

    await collectionRepository.save(collection);

    return collection.id;
  };

  return { execute };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurity } from "~/server/tools/security";

export const useCreateCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const security = useSecurity();

  return createCollectionCommandHandler(collectionRepository, security);
};
