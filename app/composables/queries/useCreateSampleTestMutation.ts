export const useCreateSampleTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      return $fetch(`/api/sample-tests`, {
        method: "post",
        body: {
          fileId,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sample-tests"] });
    },
  });
};
