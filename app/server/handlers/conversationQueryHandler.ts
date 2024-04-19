import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { ConversationDTO } from "~/server/dto/conversationDto";

const conversationQueryHandler = (
  securityService: SecurityService,
  kysely: KyselyClient,
) => {
  const execute = async (conversationId: string) => {
    const user = await securityService.getUser();

    const data: ConversationDTO = await kysely
      .selectFrom("conversations as c")
      .select((eb) => [
        "c.id",
        "c.name",
        jsonArrayFrom(
          eb
            .selectFrom("conversations_files as cf")
            .innerJoin("files as f", "cf.fileId", "f.id")
            .select(["f.id", "f.name", "f.originalName", "f.createdAt"])
            .whereRef("cf.conversationId", "=", "c.id"),
        ).as("files"),
        jsonArrayFrom(
          eb
            .selectFrom("messages as m")
            .select(["m.id", "m.content", "m.createdAt", "m.role"])
            .whereRef("m.conversationId", "=", "c.id")
            .orderBy("m.createdAt", "asc"),
        ).as("messages"),
      ])
      .where("c.id", "=", conversationId)
      .where("c.userId", "=", user.id)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useConversationQueryHandler = () => {
  const securityService = useSecurityService();
  const kyselyClient = useKyselyClient();

  return conversationQueryHandler(securityService, kyselyClient);
};
