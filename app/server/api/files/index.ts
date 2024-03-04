import { useFilesQueryHandler } from "~/server/handlers/filesQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useFilesQueryHandler();

  return execute();
});
