import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { ConversationDTO } from "~/server/dto/conversationDto";

export interface ConversationQueryHandler {
  execute: (conversationId: string) => Promise<ConversationDTO>;
}

const conversationQueryHandler = (
  security: Security,
  kysely: KyselyClient,
): ConversationQueryHandler => {
  const execute = async (conversationId: string) => {
    const user = await security.getUser();

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
import { useSecurity } from "~/server/tools/security";

export const useConversationQueryHandler = () => {
  const security = useSecurity();
  const kyselyClient = useKyselyClient();

  return conversationQueryHandler(security, kyselyClient);
};
