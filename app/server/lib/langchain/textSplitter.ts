import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { TextSplitter } from "langchain/text_splitter";

export const textSplitter = (): TextSplitter => {
  const config = useRuntimeConfig();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.chunkSize,
  });

  return splitter;
};

export const useTextSplitter = () => {
  return textSplitter();
};
