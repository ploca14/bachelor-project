export const useSampleTestsQuery = () => {
  return useQuery({
    queryKey: ["sample-tests"],
    queryFn: () => {
      return $fetch("/api/sample-tests");
    },
  });
};
