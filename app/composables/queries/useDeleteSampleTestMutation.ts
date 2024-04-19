export const useDeleteSampleTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => {
      return $fetch(`/api/sample-tests/${testId}`, {
        method: "delete",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sample-tests"],
        exact: true,
      });
    },
  });
};
