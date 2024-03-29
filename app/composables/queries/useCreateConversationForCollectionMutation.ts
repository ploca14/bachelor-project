export const useCreateConversationForCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return $fetch(`/api/collections/${id}/conversations`, {
        method: "post",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
