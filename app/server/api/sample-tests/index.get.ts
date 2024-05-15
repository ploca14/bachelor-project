import { useSampleTestsQueryHandler } from "~/server/handlers/query/sampleTestsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useSampleTestsQueryHandler();

  return execute();
});
