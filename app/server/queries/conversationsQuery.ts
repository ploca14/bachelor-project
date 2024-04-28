import type { KyselyClient } from "~/server/lib/kysely/client";
import type { ConversationListItemDTO } from "~/server/dto/conversationListItemDto";

export interface ConversationsQuery {
  execute: (userId: string) => Promise<ConversationListItemDTO[]>;
}

const conversationsQuery = (kysely: KyselyClient): ConversationsQuery => {
  const execute = async (userId: string) => {
    const data: ConversationListItemDTO[] = await kysely
      .selectFrom("conversations as c")
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom("messages as m")
            .select(["m.createdAt", "m.content"])
            .whereRef("m.conversationId", "=", "c.id")
            .orderBy("m.createdAt", "desc")
            .limit(1)
            .as("lastMessage"),
        (join) => join.onTrue(),
      )
      .select(({ fn }) => [
        "c.id",
        "c.name",
        "lastMessage.createdAt as lastMessageSentAt",
        "lastMessage.content as lastMessage",
        fn("coalesce", ["lastMessage.createdAt", "c.createdAt"]).as(
          "orderDate",
        ),
      ])
      .where("c.userId", "=", userId)
      .orderBy("orderDate", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";

export const useConversationsQuery = () => {
  const kysely = useKyselyClient();

  return conversationsQuery(kysely);
};
