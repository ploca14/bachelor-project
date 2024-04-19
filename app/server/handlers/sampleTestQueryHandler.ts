import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SecurityService } from "~/server/services/securityService";
import type { SampleTestDTO } from "~/server/dto/sampleTestDto";

export interface SampleTestQueryHandler {
  execute: (testId: string) => Promise<SampleTestDTO>;
}

const sampleTestQueryHandler = (
  securityService: SecurityService,
  kysely: KyselyClient,
): SampleTestQueryHandler => {
  const execute = async (testId: string) => {
    const user = await securityService.getUser();

    const data: SampleTestDTO = await kysely
      .selectFrom("sample_tests as st")
      .select((eb) => [
        "id",
        "name",
        "status",
        jsonArrayFrom(
          eb
            .selectFrom("questions as q")
            .select(["q.id", "q.content"])
            .whereRef("q.testId", "=", "st.id"),
        ).as("questions"),
      ])
      .where("id", "=", testId)
      .where("userId", "=", user.id)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

import { useKyselyClient } from "~/server/lib/kysely/client";
import { useSecurityService } from "~/server/services/securityService";

export const useSampleTestQueryHandler = () => {
  const securityService = useSecurityService();
  const kyselyClient = useKyselyClient();

  return sampleTestQueryHandler(securityService, kyselyClient);
};
