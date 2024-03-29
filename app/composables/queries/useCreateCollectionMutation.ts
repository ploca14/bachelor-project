export const useCreateCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { name: string; fileIds: string[] }) => {
      const { name, fileIds } = variables;

      return await $fetch(`/api/collections`, {
        method: "post",
        body: {
          name,
          fileIds,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
