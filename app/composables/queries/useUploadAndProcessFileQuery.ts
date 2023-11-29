import { PendingFile } from "#imports";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUploadAndProcessFileQuery = () => {
  const pendingFiles = ref<Set<PendingFile>>(new Set());
  const queryClient = useQueryClient();
  const fileService = useFileService();

  const mutation = useMutation({
    mutationFn: (file: PendingFile) =>
      fileService.upload(file, (progress) => (file.progress = progress)),
    onSuccess: async (_objectName, file) => {
      file.status = "processing";
      await fileService.postProcess(file);
      await queryClient.invalidateQueries({ queryKey: ["files"] });
      pendingFiles.value.delete(file);
    },
    onError: (error, file) => {
      file.status = "failed";
      // #TODO add error message
    },
  });

  const onMutate = (file: File) => {
    const pendingFile = reactive(PendingFile.fromFile(file));
    pendingFiles.value.add(pendingFile);
    mutation.mutate(pendingFile);
  };

  return { ...mutation, mutate: onMutate, pendingFiles };
};
