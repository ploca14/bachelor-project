import { useConversationQueryHandler } from "~/server/handlers/conversationsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useConversationQueryHandler();

  return execute();
});
