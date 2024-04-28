import type { Security } from "~/server/tools/security";
import type { SampleTestsQuery } from "~/server/queries/sampleTestsQuery";
import type { SampleTestListItemDTO } from "~/server/dto/sampleTestListItemDto";

export interface SampleTestsQueryHandler {
  execute: () => Promise<SampleTestListItemDTO[]>;
}

const sampleTestsQueryHandler = (
  security: Security,
  sampleTestsQuery: SampleTestsQuery,
): SampleTestsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

    return sampleTestsQuery.execute(user.id);
  };

  return { execute };
};

import { useSecurity } from "~/server/tools/security";
import { useSampleTestsQuery } from "~/server/queries/sampleTestsQuery";

export const useSampleTestsQueryHandler = () => {
  const security = useSecurity();
  const sampleTestsQuery = useSampleTestsQuery();

  return sampleTestsQueryHandler(security, sampleTestsQuery);
};
