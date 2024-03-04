export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return $fetch(`/api/files/${id}`, {
        method: "delete",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
