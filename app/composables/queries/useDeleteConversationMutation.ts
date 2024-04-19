export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      return $fetch(`/api/conversations/${conversationId}`, {
        method: "delete",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
        exact: true,
      });
    },
  });
};
