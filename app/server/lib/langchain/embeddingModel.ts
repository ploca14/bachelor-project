import { OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";

const openAIEmbeddingModel = (): Embeddings => {
  const model = new OpenAIEmbeddings();

  return model;
};

export const useEmbeddingModel = () => {
  return openAIEmbeddingModel();
};
