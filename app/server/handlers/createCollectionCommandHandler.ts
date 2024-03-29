import { Collection } from "~/server/domain/collection";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";

const createCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  securityService: SecurityService,
) => {
  const execute = async (name: string, fileIds: string[]) => {
    const user = await securityService.getUser();

    const collection = new Collection(name, fileIds, user.id);

    await collectionRepository.save(collection);

    return collection.id;
  };

  return { execute };
};

import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurityService } from "~/server/services/securityService";

export const useCreateCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const securityService = useSecurityService();

  return createCollectionCommandHandler(collectionRepository, securityService);
};
