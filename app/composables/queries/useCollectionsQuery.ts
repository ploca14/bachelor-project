export const useCollectionsQuery = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => {
      return $fetch("/api/collections");
    },
  });
};
