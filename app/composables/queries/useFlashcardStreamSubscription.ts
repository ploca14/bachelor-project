import { useEventSource } from "@vueuse/core";
import type { FlashcardDeckDTO } from "~/server/dto/flashcardDeckDto";

export const useFlashcardStreamSubscription = (deckId: string) => {
  const queryClient = useQueryClient();

  const isStreaming = ref(true);
  const isSuccess = ref(false);

  const { event, data, close, error } = useEventSource(
    `/api/flashcard-decks/${deckId}/stream`,
    ["progress", "complete"] as const,
  );

  watchEffect(async () => {
    if (event.value === "progress") {
      if (!isDefined(data.value)) return;
      const flashcards = JSON.parse(data.value);
      queryClient.setQueryData(
        ["flashcard-decks", deckId],
        (oldData: FlashcardDeckDTO) => {
          return {
            ...oldData,
            flashcards,
          };
        },
      );
    }
    if (event.value === "complete") {
      await queryClient.invalidateQueries({
        queryKey: ["flashcard-decks", deckId],
      });
      close();
      isStreaming.value = false;
      isSuccess.value = true;
    }
  });

  return { isStreaming, isSuccess, error };
};
