import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
// import { TextLoader } from "langchain/document_loaders/fs/text";
import type { BaseDocumentLoader } from "langchain/document_loaders/base";

export interface LoaderFactory {
  createForBlob: (blob: Blob) => BaseDocumentLoader;
}

export const PDFLoaderFactory = (): LoaderFactory => {
  const createForBlob = (blob: Blob) => {
    return new WebPDFLoader(blob);
  };

  return { createForBlob };
};

// export const textLoaderFactory = (): LoaderFactory => {
//   const createForBlob = (blob: Blob) => {
//     return new TextLoader(blob);
//   };

//   return { createForBlob };
// };

export const useLoaderFactory = () => {
  return PDFLoaderFactory();
};
