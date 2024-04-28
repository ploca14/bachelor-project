import type { ConversationsQuery } from "~/server/queries/conversationsQuery";
import type { Security } from "~/server/tools/security";
import type { ConversationListItemDTO } from "~/server/dto/conversationListItemDto";

export interface ConversationsQueryHandler {
  execute: () => Promise<ConversationListItemDTO[]>;
}

const conversationsQueryHandler = (
  security: Security,
  conversationsQuery: ConversationsQuery,
): ConversationsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    return conversationsQuery.execute(user.id);
  };

  return { execute };
};

import { useSecurity } from "~/server/tools/security";
import { useConversationsQuery } from "~/server/queries/conversationsQuery";

export const useConversationsQueryHandler = () => {
  const security = useSecurity();
  const conversationsQuery = useConversationsQuery();

  return conversationsQueryHandler(security, conversationsQuery);
};
