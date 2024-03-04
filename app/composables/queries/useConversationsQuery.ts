export const useConversationsQuery = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => {
      return $fetch("/api/conversations");
    },
  });
};
