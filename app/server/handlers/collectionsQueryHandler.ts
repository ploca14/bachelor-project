import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { CollectionListItemDTO } from "~/server/dto/collectionListItemDto";

export interface CollectionsQueryHandler {
  execute: () => Promise<CollectionListItemDTO[]>;
}

const collectionsQueryHandler = (
  kysely: KyselyClient,
  securityService: SecurityService,
): CollectionsQueryHandler => {
  const execute = async () => {
    const user = await securityService.getUser();

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
import { useSecurityService } from "~/server/services/securityService";

export const useCollectionsQueryHandler = () => {
  const kysely = useKyselyClient();
  const securityService = useSecurityService();

  return collectionsQueryHandler(kysely, securityService);
};
