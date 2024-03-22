import { useConversationsQueryHandler } from "~/server/handlers/conversationsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useConversationsQueryHandler();

  return execute();
});
