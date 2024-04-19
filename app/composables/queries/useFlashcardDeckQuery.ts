import type { FlashcardDeckDTO } from "~/server/dto/flashcardDeckDto";

export const useFlashcardDeckQuery = (deckId: string) => {
  const queryClient = useQueryClient();

  return useQuery<DeepPartial<FlashcardDeckDTO>>({
    queryKey: ["flashcard-decks", deckId],
    queryFn: () => $fetch(`/api/flashcard-decks/${deckId}`),
    placeholderData: () => {
      const decks = queryClient.getQueryData(["flashcard-decks"]);
      if (!decks || !Array.isArray(decks)) return;

      const deck = decks.find((d) => d.id === deckId);

      if (!deck) return;

      return {
        id: deck.id,
        name: deck.name,
        flashcards: [],
      };
    },
  });
};
