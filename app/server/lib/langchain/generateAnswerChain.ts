import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseMessage } from "@langchain/core/messages";

export type GenerateAnswerChain = Runnable<
  { question: string; chat_history: BaseMessage[]; context: string },
  string
>;

export const historyAwareGenerateAnswerChain = (llm: BaseChatModel) => {
  const generateAnswerSystemPrompt = `You are an assistant for
  question-answering tasks. Use the following pieces of retrieved context to
  answer the question. If you don't know the answer, just say that you don't
  know.

  {context}`;

  const generateAnswerPrompt = ChatPromptTemplate.fromMessages([
    ["system", generateAnswerSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from<
    {
      question: string;
      chat_history: BaseMessage[];
      context: string;
    },
    string
  >([generateAnswerPrompt, llm, new StringOutputParser()]);

  return chain;
};

import { useChatModel } from "~/server/lib/langchain/chatModel";

export const useGenerateAnswerChain = () => {
  const llm = useChatModel();
  return historyAwareGenerateAnswerChain(llm);
};
