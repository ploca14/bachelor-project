export const useCollectionQuery = (collectionId: string) => {
  return useQuery({
    queryKey: ["collections", collectionId],
    queryFn: () => $fetch(`/api/collections/${collectionId}`),
  });
};
