import type { File } from "~/server/domain/file";
import type { LoaderFactory } from "~/server/lib/langchain/loaderFactory";
import type { TextSplitter } from "langchain/text_splitter";
import type { VectorStore } from "@langchain/core/vectorstores";

export interface FileProcessor {
  processFile: (file: File, blob: Blob) => Promise<void | string[]>;
}

export const langchainFileProcessor = (
  loaderFactory: LoaderFactory,
  splitter: TextSplitter,
  store: VectorStore,
): FileProcessor => {
  const processFile = async (file: File, blob: Blob) => {
    const loader = loaderFactory.createForBlob(blob);

    const docs = await loader.load();

    const chunks = await splitter.splitDocuments(docs);

    const docsWithMetadata = chunks.map((chunk) => {
      return {
        ...chunk,
        metadata: {
          ...chunk.metadata,
          ...{
            user_id: file.ownerId,
            file_id: file.id,
          },
        },
      };
    });

    return await store.addDocuments(docsWithMetadata);
  };

  return { processFile };
};

import { useTextSplitter } from "~/server/lib/langchain/textSplitter";
import { useVectorStore } from "~/server/lib/langchain/vectorStore";
import { useLoaderFactory } from "~/server/lib/langchain/loaderFactory";

export const useFileProcessor = () => {
  const loaderFactory = useLoaderFactory();
  const splitter = useTextSplitter();
  const store = useVectorStore();

  return langchainFileProcessor(loaderFactory, splitter, store);
};
