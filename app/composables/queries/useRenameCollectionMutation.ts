export const useRenameCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { collectionId: string; name: string }) => {
      const { collectionId, name } = variables;
      return $fetch(`/api/collections/${collectionId}`, {
        method: "put",
        body: { name },
      });
    },
    onSuccess: async (_data) => {
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    },
  });
};
