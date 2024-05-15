import { useFilesQueryHandler } from "~/server/handlers/query/filesQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useFilesQueryHandler();

  return execute();
});
