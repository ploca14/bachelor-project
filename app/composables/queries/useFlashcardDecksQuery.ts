export const useFlashcardDecksQuery = () => {
  return useQuery({
    queryKey: ["flashcard-decks"],
    queryFn: () => {
      return $fetch("/api/flashcard-decks");
    },
  });
};
