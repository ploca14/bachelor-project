import * as tus from "tus-js-client";
import { UnauthorizedError } from "~/types/errors";

interface UploadFileVariables {
  file: File;
  onProgress: (progress: number) => void;
}

const STORAGE_BUCKET = "files";
const UPLOAD_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

export const useUploadFileMutation = () => {
  const supabase = useSupabaseClient();
  const { url } = useRuntimeConfig().public.supabase;
  const endpoint = `${url}/storage/v1/upload/resumable`;

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new UnauthorizedError("User is not logged in");
    }

    return data.session;
  };

  const getObjectName = async (name: string) => {
    const session = await getSession();
    return `${session.user.id}/${name}`;
  };

  return useMutation({
    mutationFn: async ({ file, onProgress }: UploadFileVariables) => {
      const { access_token } = await getSession();
      const objectName = await getObjectName(file.name);

      return new Promise<string>(async (resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint,
          headers: {
            authorization: `Bearer ${access_token}`,
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: STORAGE_BUCKET,
            objectName,
            contentType: file.type,
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
    },
  });
};
