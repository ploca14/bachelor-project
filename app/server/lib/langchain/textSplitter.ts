import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { TextSplitter } from "langchain/text_splitter";

const textSplitter = (): TextSplitter => {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

  return splitter;
};

export const useTextSplitter = () => {
  return textSplitter();
};
