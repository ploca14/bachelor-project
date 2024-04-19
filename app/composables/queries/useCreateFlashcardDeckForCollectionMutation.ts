export const useCreateFlashcardDeckForCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      return $fetch(`/api/collections/${collectionId}/flashcard-decks`, {
        method: "post",
        body: {
          collectionId,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};
