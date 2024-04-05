export const useDeleteFlashcardDeckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => {
      return $fetch(`/api/flashcard-decks/${testId}`, {
        method: "delete",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["flashcard-decks"],
        exact: true,
      });
    },
  });
};
