import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { CollectionDTO } from "~/server/dto/collectionDto";

const collectionQueryHandler = (
  securityService: SecurityService,
  kysely: KyselyClient,
) => {
  const execute = async (collectionId: string) => {
    const user = await securityService.getUser();

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
import { useSecurityService } from "~/server/services/securityService";

export const useCollectionQueryHandler = () => {
  const securityService = useSecurityService();
  const kyselyClient = useKyselyClient();

  return collectionQueryHandler(securityService, kyselyClient);
};
