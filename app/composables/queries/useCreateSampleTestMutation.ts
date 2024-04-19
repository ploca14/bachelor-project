export const useCreateSampleTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      return $fetch(`/api/files/${fileId}/sample-tests`, {
        method: "post",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sample-tests"] });
    },
  });
};
