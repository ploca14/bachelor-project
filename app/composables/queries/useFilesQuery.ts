import { useQuery } from "@tanstack/vue-query";

export const useFilesQuery = () => {
  const { fetchProcessed } = useFileService();

  return useQuery({
    queryKey: ["files"],
    queryFn: fetchProcessed,
  });
};
