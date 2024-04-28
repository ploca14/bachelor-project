import { SampleTestQuery } from "~/server/queries/sampleTestQuery";
import type { Security } from "~/server/tools/security";
import type { SampleTestDTO } from "~/server/dto/sampleTestDto";

export interface SampleTestQueryHandler {
  execute: (testId: string) => Promise<SampleTestDTO>;
}

const sampleTestQueryHandler = (
  security: Security,
  sampleTestQuery: SampleTestQuery,
): SampleTestQueryHandler => {
  const execute = async (testId: string) => {
    const user = await security.getUser();

    return sampleTestQuery.execute(testId, user.id);
  };

  return { execute };
};

import { useSecurity } from "~/server/tools/security";
import { useSampleTestQuery } from "~/server/queries/sampleTestQuery";

export const useSampleTestQueryHandler = () => {
  const security = useSecurity();
  const sampleTestQuery = useSampleTestQuery();

  return sampleTestQueryHandler(security, sampleTestQuery);
};
