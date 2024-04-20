import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { ConversationListItemDTO } from "~/server/dto/conversationListItemDto";

export interface ConversationsQueryHandler {
  execute: () => Promise<ConversationListItemDTO[]>;
}

const conversationsQueryHandler = (
  kysely: KyselyClient,
  security: Security,
): ConversationsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

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
      .where("c.userId", "=", user.id)
      .orderBy("orderDate", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurity } from "~/server/tools/security";

export const useConversationsQueryHandler = () => {
  const kysely = useKyselyClient();
  const security = useSecurity();

  return conversationsQueryHandler(kysely, security);
};
