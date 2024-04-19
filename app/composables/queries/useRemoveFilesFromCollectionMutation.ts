export const useRemoveFilesFromCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { collectionId: string; fileIds: string[] }) => {
      const { collectionId, fileIds } = variables;
      return $fetch(`/api/collections/${collectionId}/files`, {
        method: "delete",
        body: { fileIds },
      });
    },
    onSuccess: async (_data, { collectionId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["collections", collectionId],
      });
    },
  });
};
