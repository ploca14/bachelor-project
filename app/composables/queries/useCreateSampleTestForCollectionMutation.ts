export const useCreateSampleTestForCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      return $fetch(`/api/collections/${collectionId}/sample-tests`, {
        method: "post",
        body: {
          collectionId,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sample-tests"] });
    },
  });
};
