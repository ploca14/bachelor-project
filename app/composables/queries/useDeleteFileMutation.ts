export const useDeleteFilesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileIds: string[]) => {
      return $fetch(`/api/files`, {
        method: "delete",
        body: { fileIds },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
};
