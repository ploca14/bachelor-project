export const useFilesQuery = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: () => {
      return $fetch("/api/files");
    },
  });
};
