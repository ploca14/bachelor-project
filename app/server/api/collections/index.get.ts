import { useCollectionsQueryHandler } from "~/server/handlers/collectionsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useCollectionsQueryHandler();

  return execute();
});
