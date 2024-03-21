import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import type { Document } from "@langchain/core/documents";
import { formatDocumentsAsString } from "langchain/util/document";

export type GenerateFlashcardsChain = Runnable<Document, string>;

const simpleGenerateFlashcardsChain = (llm: BaseLanguageModel) => {
  const generateFlashcardsPrompt = ChatPromptTemplate.fromTemplate(
    'You are an assistant for\
    generating flashcards. Use the following piece of context to\
    generate multiple flashcards. You must format your output in JSON format.\
    Output only a list of objects. Each object should have the key "front" and "back".\n\
    \n\
    The context:\n\
    {context}',
  );

  const chain = RunnableSequence.from([
    {
      context: (doc: Document) => formatDocumentsAsString([doc]),
    },
    generateFlashcardsPrompt,
    llm,
    new StringOutputParser(),
  ]);

  return chain;
};

import { useChatModel } from "~/server/lib/langchain/chatModel";

export const useGenerateFlashcardsChain = () => {
  const llm = useChatModel();
  return simpleGenerateFlashcardsChain(llm);
};
