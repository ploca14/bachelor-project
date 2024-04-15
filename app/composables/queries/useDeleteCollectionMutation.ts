export const useDeleteCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => {
      return $fetch(`/api/collections/${collectionId}`, {
        method: "delete",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
        exact: true,
      });
    },
  });
};
