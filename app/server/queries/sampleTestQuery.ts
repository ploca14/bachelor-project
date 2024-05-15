import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SampleTestDTO } from "~/server/dto/sampleTestDto";

export interface SampleTestQuery {
  execute: (testId: string, userId: string) => Promise<SampleTestDTO>;
}

const sampleTestQuery = (kysely: KyselyClient): SampleTestQuery => {
  const execute = async (testId: string, userId: string) => {
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
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow();

    return data;
  };

  return { execute };
};

/* v8 ignore start */
import { useKyselyClient } from "~/server/lib/kysely/client";

export const useSampleTestQuery = () => {
  const kyselyClient = useKyselyClient();

  return sampleTestQuery(kyselyClient);
};
