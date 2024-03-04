import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import type { BaseDocumentLoader } from "langchain/document_loaders/base";

export interface LoaderFactory {
  createForBlob: (blob: Blob) => BaseDocumentLoader;
}

const PDFLoaderFactory = (): LoaderFactory => {
  const createForBlob = (blob: Blob) => {
    return new WebPDFLoader(blob);
  };

  return { createForBlob };
};

export const useLoaderFactory = () => {
  return PDFLoaderFactory();
};
