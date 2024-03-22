import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { ConversationListItemDTO } from "~/server/dto/conversationListItemDto";

const conversationsQueryHandler = (
  kysely: KyselyClient,
  securityService: SecurityService,
) => {
  const execute = async () => {
    const user = await securityService.getUser();

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
      .select([
        "c.id",
        "c.name",
        "lastMessage.createdAt as lastMessageSentAt",
        "lastMessage.content as lastMessage",
      ])
      .where("c.userId", "=", user.id)
      .orderBy("lastMessage.createdAt", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useConversationsQueryHandler = () => {
  const kysely = useKyselyClient();
  const securityService = useSecurityService();

  return conversationsQueryHandler(kysely, securityService);
};
