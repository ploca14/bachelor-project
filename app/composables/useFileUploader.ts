import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

type UseFileUploader = () => {
  uploadFiles: (files: FileList) => void;
};

const STORAGE_BUCKET = "files";
const uppy = new Uppy({
  autoProceed: true,
});

const useSupaseFileUploader = () => {
  const { url } = useRuntimeConfig().public.supabase;
  const endpoint = `${url}/storage/v1/upload/resumable`;
  const { session, user } = useAuth();

  uppy.use(Tus, {
    endpoint,
    headers: () => ({
      authorization: `Bearer ${session.value?.access_token}`,
    }),
    uploadDataDuringCreation: true,
    chunkSize: 6 * 1024 * 1024,
    allowedMetaFields: [
      "bucketName",
      "objectName",
      "contentType",
      "cacheControl",
    ],
  });

  uppy.on("file-added", (file) => {
    const folder = user.value?.id;

    const supabaseMetadata = {
      bucketName: STORAGE_BUCKET,
      objectName: `${folder}/${file.name}`,
      contentType: file.type,
    };

    file.meta = {
      ...file.meta,
      ...supabaseMetadata,
    };
  });

  const uploadFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList);

    const files = filesArray.map((file) => ({
      source: "Local",
      name: file.name,
      type: file.type,
      data: file,
    }));

    uppy.addFiles(files);
  };

  return {
    uploadFiles,
  };
};

export const useFileUploader: UseFileUploader = useSupaseFileUploader;
