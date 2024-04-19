import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { SampleTestListItemDTO } from "~/server/dto/sampleTestListItemDto";

export interface SampleTestsQueryHandler {
  execute: () => Promise<SampleTestListItemDTO[]>;
}

const sampleTestsQueryHandler = (
  kysely: KyselyClient,
  securityService: SecurityService,
): SampleTestsQueryHandler => {
  const execute = async () => {
    const user = await securityService.getUser();

    const data: SampleTestListItemDTO[] = await kysely
      .selectFrom("sample_tests as st")
      .select(["st.id", "st.name", "st.createdAt"])
      .where("st.userId", "=", user.id)
      .orderBy("st.createdAt", "desc")
      .execute();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useSampleTestsQueryHandler = () => {
  const kysely = useKyselyClient();
  const securityService = useSecurityService();

  return sampleTestsQueryHandler(kysely, securityService);
};
