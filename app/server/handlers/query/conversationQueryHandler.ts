import type { ConversationQuery } from "~/server/queries/conversationQuery";
import type { Security } from "~/server/tools/security";
import type { ConversationDTO } from "~/server/dto/conversationDto";

export interface ConversationQueryHandler {
  execute: (conversationId: string) => Promise<ConversationDTO>;
}

const conversationQueryHandler = (
  security: Security,
  conversationQuery: ConversationQuery,
): ConversationQueryHandler => {
  const execute = async (conversationId: string) => {
    const user = await security.getUser();

    return conversationQuery.execute(conversationId, user.id);
  };

  return { execute };
};

/* v8 ignore start */
import { useSecurity } from "~/server/tools/security";
import { useConversationQuery } from "~/server/queries/conversationQuery";

export const useConversationQueryHandler = () => {
  const security = useSecurity();
  const conversationQuery = useConversationQuery();

  return conversationQueryHandler(security, conversationQuery);
};
