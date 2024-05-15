import { useConversationsQueryHandler } from "~/server/handlers/query/conversationsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useConversationsQueryHandler();

  return execute();
});
