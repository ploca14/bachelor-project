import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { CollectionDTO } from "~/server/dto/collectionDto";

export interface CollectionQuery {
  execute: (collectionId: string, userId: string) => Promise<CollectionDTO>;
}

export const collectionQuery = (kysely: KyselyClient): CollectionQuery => {
  const execute = async (collectionId: string, userId: string) => {
    const data: CollectionDTO = await kysely
      .selectFrom("collections as c")
      .select((eb) => [
        "c.id",
        "c.name",
        jsonArrayFrom(
          eb
            .selectFrom("collections_files as cf")
            .innerJoin("files as f", "cf.fileId", "f.id")
            .select(["f.id", "f.name", "f.originalName", "f.createdAt"])
            .whereRef("cf.collectionId", "=", "c.id"),
        ).as("files"),
      ])
      .where("c.id", "=", collectionId)
      .where("c.userId", "=", userId)
      .executeTakeFirstOrThrow();

    return data;
  };

  return {
    execute,
  };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useCollectionQuery = () => {
  const kysely = useKyselyClient();

  return collectionQuery(kysely);
};
