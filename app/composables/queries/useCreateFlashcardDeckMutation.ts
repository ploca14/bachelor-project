export const useCreateFlashcardDeckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      return $fetch(`/api/flashcard-decks`, {
        method: "post",
        body: {
          fileId,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};
