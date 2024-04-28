import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { ConversationDTO } from "~/server/dto/conversationDto";

export interface ConversationQuery {
  execute: (conversationId: string, userId: string) => Promise<ConversationDTO>;
}

const conversationQuery = (kysely: KyselyClient): ConversationQuery => {
  const execute = async (conversationId: string, userId: string) => {
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
      .where("c.userId", "=", userId)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useConversationQuery = () => {
  const kyselyClient = useKyselyClient();

  return conversationQuery(kyselyClient);
};
