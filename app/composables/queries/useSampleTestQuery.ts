import type { SampleTestDTO } from "~/server/dto/sampleTestDto";

export const useSampleTestQuery = (testId: string) => {
  const queryClient = useQueryClient();

  return useQuery<DeepPartial<SampleTestDTO>>({
    queryKey: ["sample-tests", testId],
    queryFn: () => $fetch(`/api/sample-tests/${testId}`),
    placeholderData: () => {
      const decks = queryClient.getQueryData(["sample-tests"]);
      if (!decks || !Array.isArray(decks)) return;

      const deck = decks.find((d) => d.id === testId);

      if (!deck) return;

      return {
        id: deck.id,
        name: deck.name,
        questions: [],
      };
    },
  });
};
