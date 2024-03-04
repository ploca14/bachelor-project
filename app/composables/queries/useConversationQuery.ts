export const useConversationQuery = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: () => $fetch(`/api/conversations/${conversationId}`),
  });
};
