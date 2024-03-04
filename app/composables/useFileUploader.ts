import { PendingFile } from "./pendingFile";

const useFileUploaderState = () => {
  const isStarted = ref(false);
  const pendingFiles = ref<Set<PendingFile>>(new Set());

  const create = (file: File) => {
    isStarted.value = true;

    const pendingFile = reactive(
      new PendingFile(file.name, "uploading"),
    ) as PendingFile;

    pendingFiles.value.add(pendingFile);

    return pendingFile;
  };

  const complete = (file: PendingFile) => {
    pendingFiles.value.delete(file);
  };

  const isPending = computed(() => {
    const isUploading =
      Array.from(pendingFiles.value.values()).filter(
        (file) => file.status === "uploading",
      ).length > 0;

    return isStarted.value && isUploading;
  });

  const reset = () => {
    isStarted.value = false;
    pendingFiles.value = new Set();
  };

  return {
    isPending,
    pendingFiles,
    create,
    complete,
    reset,
  };
};

export const useFileUploader = () => {
  const state = useFileUploaderState();
  const fileDialog = useFileDialog({
    accept: "application/pdf",
  });
  const { mutateAsync: uploadFile } = useUploadFileMutation();
  const { mutateAsync: processFile } = useProcessFileMutation();

  fileDialog.onChange(async (files: FileList | null) => {
    state.reset();
    if (!files) {
      return;
    }

    const promises = Array.from(files).map(async (rawFile) => {
      const pendingFile = state.create(rawFile);

      // Rename file
      const data = new FormData();
      data.append("file", rawFile, pendingFile.name);

      const file = data.get("file") as File;

      try {
        await uploadFile({
          file,
          onProgress: (progress) => {
            pendingFile.uploadProgress = progress;
          },
        });

        pendingFile.startProcessing();

        await processFile({ file, originalName: pendingFile.originalName });

        state.complete(pendingFile);
      } catch (error) {
        if (error instanceof Error) {
          pendingFile.markAsFailed(error.message);
        }
      }
    });

    await Promise.allSettled(promises);

    fileDialog.reset();
  });

  const sortedPendingFiles = computed(() =>
    Array.from(state.pendingFiles.value.values()).sort((a, b) => {
      return a.name.localeCompare(b.name);
    }),
  );

  return {
    openFileDialog: fileDialog.open,
    isPending: state.isPending,
    pendingFiles: sortedPendingFiles,
  };
};
