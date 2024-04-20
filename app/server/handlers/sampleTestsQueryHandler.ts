import type { KyselyClient } from "~/server/lib/kysely/client";
import type { Security } from "~/server/tools/security";
import type { SampleTestListItemDTO } from "~/server/dto/sampleTestListItemDto";

export interface SampleTestsQueryHandler {
  execute: () => Promise<SampleTestListItemDTO[]>;
}

const sampleTestsQueryHandler = (
  kysely: KyselyClient,
  security: Security,
): SampleTestsQueryHandler => {
  const execute = async () => {
    const user = await security.getUser();

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
import { useSecurity } from "~/server/tools/security";

export const useSampleTestsQueryHandler = () => {
  const kysely = useKyselyClient();
  const security = useSecurity();

  return sampleTestsQueryHandler(kysely, security);
};
