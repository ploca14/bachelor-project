import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { CollectionListItemDTO } from "~/server/dto/collectionListItemDto";

export interface CollectionsQueryHandler {
  execute: () => Promise<CollectionListItemDTO[]>;
}

const collectionsQueryHandler = (
  kysely: KyselyClient,
  security: Security,
): CollectionsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    const data: CollectionListItemDTO[] = await kysely
      .selectFrom("collections as c")
      .leftJoin("collections_files as cf", "cf.collectionId", "c.id")
      .select(({ fn }) => [
        "c.id",
        "c.name",
        fn.count<number>("cf.fileId").as("fileCount"),
      ])
      .groupBy("c.id")
      .where("c.userId", "=", user.id)
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurity } from "~/server/tools/security";

export const useCollectionsQueryHandler = () => {
  const kysely = useKyselyClient();
  const security = useSecurity();

  return collectionsQueryHandler(kysely, security);
};
