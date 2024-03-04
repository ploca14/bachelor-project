interface ProcessFileVariables {
  file: File;
  originalName: string;
}

export const useProcessFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, originalName }: ProcessFileVariables) => {
      return await $fetch("/api/files", {
        method: "post",
        body: {
          name: file.name,
          originalName,
        },
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
