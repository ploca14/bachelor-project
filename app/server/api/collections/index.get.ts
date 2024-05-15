import { useCollectionsQueryHandler } from "~/server/handlers/query/collectionsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useCollectionsQueryHandler();

  return execute();
});
