import type { Security } from "~/server/tools/security";
import type { CollectionsQuery } from "~/server/queries/collectionsQuery";
import type { CollectionListItemDTO } from "~/server/dto/collectionListItemDto";

export interface CollectionsQueryHandler {
  execute: () => Promise<CollectionListItemDTO[]>;
}

const collectionsQueryHandler = (
  security: Security,
  collectionsQuery: CollectionsQuery,
): CollectionsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    return collectionsQuery.execute(user.id);
  };

  return { execute };
};

/* v8 ignore start */
import { useSecurity } from "~/server/tools/security";
import { useCollectionsQuery } from "~/server/queries/collectionsQuery";

export const useCollectionsQueryHandler = () => {
  const security = useSecurity();
  const collectionsQuery = useCollectionsQuery();

  return collectionsQueryHandler(security, collectionsQuery);
};
