import type { KyselyClient } from "~/server/lib/kysely/client";
import type { CollectionListItemDTO } from "~/server/dto/collectionListItemDto";

export interface CollectionsQuery {
  execute: (userId: string) => Promise<CollectionListItemDTO[]>;
}

export const collectionsQuery = (kysely: KyselyClient): CollectionsQuery => {
  const execute = async (userId: string) => {
    const data: CollectionListItemDTO[] = await kysely
      .selectFrom("collections as c")
      .leftJoin("collections_files as cf", "cf.collectionId", "c.id")
      .select(({ fn }) => [
        "c.id",
        "c.name",
        fn.count<number>("cf.fileId").as("fileCount"),
      ])
      .groupBy("c.id")
      .where("c.userId", "=", userId)
      .execute();

    return data;
  };

  return {
    execute,
  };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useCollectionsQuery = () => {
  const kysely = useKyselyClient();

  return collectionsQuery(kysely);
};
