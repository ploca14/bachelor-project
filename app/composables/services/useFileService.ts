import { PendingFile, UploadedFile } from "#imports";
import * as tus from "tus-js-client";

const STORAGE_BUCKET = "files";
const UPLOAD_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

type UseFileService = () => {
  upload(
    file: PendingFile,
    onProgress: (progress: number) => void,
  ): Promise<string>;

  postProcess(file: PendingFile): Promise<void>;

  remove(id: string): Promise<void>;

  fetchProcessed(): Promise<UploadedFile[]>;
};

const useSupabaseFileService = () => {
  const supabase = useSupabase();

  const getAcessToken = async () => {
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token;
  };

  const getEndpoint = () => {
    const { url } = useRuntimeConfig().public.supabase;
    return `${url}/storage/v1/upload/resumable`;
  };

  const getObjectName = (pendingFile: PendingFile) => {
    const user = useUser();
    return `${user.value.id}/${pendingFile.id}`;
  };

  const upload = async (
    pendingFile: PendingFile,
    onProgress: (progress: number) => void,
  ) => {
    const endpoint = getEndpoint();
    const accessToken = await getAcessToken();
    const objectName = getObjectName(pendingFile);

    return new Promise<string>(async (resolve, reject) => {
      const upload = new tus.Upload(pendingFile.file, {
        endpoint,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: STORAGE_BUCKET,
          objectName,
          contentType: pendingFile.file.type,
          cacheControl: "3600",
        },
        chunkSize: UPLOAD_CHUNK_SIZE,
        onError: (error) => {
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          if (onProgress) {
            onProgress(percentage);
          }
        },
        onSuccess: () => {
          resolve(objectName);
        },
      });

      // Check if there are any previous uploads to continue.
      const previousUploads = await upload.findPreviousUploads();
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      // Start the upload
      upload.start();
    });
  };

  const postProcess = async (file: PendingFile) => {
    await $fetch("/api/files", {
      method: "post",
      body: {
        file,
      },
    });
  };

  const remove = async (id: string) => {
    await $fetch(`/api/files/${id}`, {
      method: "delete",
    });
  };

  const fetchProcessed = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("status", "PROCESSED")
      .order("created_at", { ascending: false })
      .order("original_name", { ascending: true });

    if (error) {
      throw error.message;
    }

    return data.map((file) => UploadedFile.fromSupabaseFile(file));
  };

  return {
    upload,
    postProcess,
    remove,
    fetchProcessed,
  };
};

export const useFileService: UseFileService = useSupabaseFileService;
