export const useFileUploader = () => {
  const { mutate, isPending, pendingFiles } = useUploadAndProcessFileQuery();

  const { open, onChange, reset } = useFileDialog({
    accept: ".pdf",
    multiple: true,
  });

  onChange((files: FileList) => {
    Array.from(files).forEach((file) => {
      mutate(file);
    });

    reset();
  });

  const pendingFilesArray = computed(() =>
    Array.from(pendingFiles.value).sort((a, b) => {
      return a.name.localeCompare(b.name);
    }),
  );

  return {
    openFileDialog: open,
    isPending,
    pendingFiles: pendingFilesArray,
  };
};
