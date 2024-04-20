import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { CollectionDTO } from "~/server/dto/collectionDto";

export interface CollectionQueryHandler {
  execute: (collectionId: string) => Promise<CollectionDTO>;
}

const collectionQueryHandler = (
  security: Security,
  kysely: KyselyClient,
): CollectionQueryHandler => {
  const execute = async (collectionId: string) => {
    const user = await security.getUser();

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
      .where("c.userId", "=", user.id)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurity } from "~/server/tools/security";

export const useCollectionQueryHandler = () => {
  const security = useSecurity();
  const kyselyClient = useKyselyClient();

  return collectionQueryHandler(security, kyselyClient);
};
