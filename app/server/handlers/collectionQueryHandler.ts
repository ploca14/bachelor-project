import type { CollectionQuery } from "~/server/queries/collectionQuery";
import type { Security } from "~/server/tools/security";
import type { CollectionDTO } from "~/server/dto/collectionDto";

export interface CollectionQueryHandler {
  execute: (collectionId: string) => Promise<CollectionDTO>;
}

const collectionQueryHandler = (
  security: Security,
  collectionQuery: CollectionQuery,
): CollectionQueryHandler => {
  const execute = async (collectionId: string) => {
    const user = await security.getUser();

    return collectionQuery.execute(collectionId, user.id);
  };

  return { execute };
};

import { useCollectionQuery } from "~/server/queries/collectionQuery";
import { useSecurity } from "~/server/tools/security";

export const useCollectionQueryHandler = () => {
  const security = useSecurity();
  const collectionQuery = useCollectionQuery();

  return collectionQueryHandler(security, collectionQuery);
};
