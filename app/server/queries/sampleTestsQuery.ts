import type { KyselyClient } from "~/server/lib/kysely/client";
import type { SampleTestListItemDTO } from "~/server/dto/sampleTestListItemDto";

export interface SampleTestsQuery {
  execute: (userId: string) => Promise<SampleTestListItemDTO[]>;
}

const sampleTestsQuery = (kysely: KyselyClient): SampleTestsQuery => {
  const execute = async (userId: string) => {
    const data: SampleTestListItemDTO[] = await kysely
      .selectFrom("sample_tests as st")
      .select(["st.id", "st.name", "st.createdAt"])
      .where("st.userId", "=", userId)
      .orderBy("st.createdAt", "desc")
      .execute();

    return data;
  };

  return { execute };
};

/* v8 ignore start */
import { useKyselyClient } from "~/server/lib/kysely/client";

export const useSampleTestsQuery = () => {
  const kysely = useKyselyClient();

  return sampleTestsQuery(kysely);
};
