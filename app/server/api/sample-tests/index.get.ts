import { useSampleTestsQueryHandler } from "~/server/handlers/sampleTestsQueryHandler";

export default defineEventHandler(async (event) => {
  const { execute } = useSampleTestsQueryHandler();

  return execute();
});
