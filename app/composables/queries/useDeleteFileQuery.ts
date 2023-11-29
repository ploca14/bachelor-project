import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useDeleteFileQuery = () => {
  const queryClient = useQueryClient();
  const { remove } = useFileService();

  return useMutation({
    mutationFn: remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
