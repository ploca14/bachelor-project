import { useEventSource } from "@vueuse/core";
import type { SampleTestDTO } from "~/server/dto/sampleTestDto";

export const useQuestionStreamSubscription = (testId: string) => {
  const queryClient = useQueryClient();

  const isStreaming = ref(true);
  const isSuccess = ref(false);

  const { event, data, close, error } = useEventSource(
    `/api/sample-tests/${testId}/stream`,
    ["progress", "complete"] as const,
  );

  watchEffect(async () => {
    if (event.value === "progress") {
      if (!isDefined(data.value)) return;
      const questions = JSON.parse(data.value);
      queryClient.setQueryData(
        ["sample-tests", testId],
        (oldData: SampleTestDTO) => {
          return {
            ...oldData,
            questions,
          };
        },
      );
    }

    if (event.value === "complete") {
      await queryClient.invalidateQueries({
        queryKey: ["sample-tests", testId],
      });
      close();
      isStreaming.value = false;
      isSuccess.value = true;
    }

    if (error.value) {
      await queryClient.invalidateQueries({
        queryKey: ["sample-tests", testId],
      });
    }
  });

  return { isStreaming, isSuccess, error };
};
