import { splitListOfDocs } from "langchain/chains/combine_documents/reduce";
import { formatDocumentsAsString } from "langchain/util/document";
import { Document } from "@langchain/core/documents";
import { RunnableLambda, Runnable } from "@langchain/core/runnables";

export type DocumentBatcher = Runnable<Document[], Document[][]>;

export const simpleDocumentBatcher = (config: {
  charsPerToken: number;
  maxTokensPerBatch: number;
}): DocumentBatcher => {
  const getNumTokens = (documents: Document[]) => {
    return formatDocumentsAsString(documents).length / config.charsPerToken;
  };

  const chain = RunnableLambda.from((docs: Document[]) => {
    console.log("====DOCS====\n\n", docs);
    return splitListOfDocs(docs, getNumTokens, config.maxTokensPerBatch);
  });

  return chain;
};

export const singleDocumentBatcher = (): DocumentBatcher => {
  const chain = RunnableLambda.from((docs: Document[]) => {
    return docs.map((doc) => [doc]);
  });

  return chain;
};

export const useDocumentBatcher = () => {
  const config = useRuntimeConfig();
  const charsPerToken = Number(config.charsPerToken);
  const maxTokensPerBatch = Number(config.maxTokensPerBatch);

  return simpleDocumentBatcher({ charsPerToken, maxTokensPerBatch });
};
