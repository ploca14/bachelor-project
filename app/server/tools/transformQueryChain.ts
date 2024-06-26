import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence, Runnable } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import type { BaseMessage } from "@langchain/core/messages";

export type TransformQueryChain = Runnable<
  { chat_history: BaseMessage[]; question: string },
  string
>;

const transformQuerySystemPrompt = `Given the above conversation, generate a search query which can used without the chat history in order to find information relevant to the conversation`;

export const historyAwareTransformQueryChain = (llm: BaseLanguageModel) => {
  const transformQueryPrompt = ChatPromptTemplate.fromMessages([
    ["system", transformQuerySystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["user", "{question}"],
  ]);

  const chain = RunnableSequence.from<
    {
      chat_history: BaseMessage[];
      question: string;
    },
    string
  >([transformQueryPrompt, llm, new StringOutputParser()]);

  return chain;
};

/* v8 ignore start */
import { useChatModel } from "~/server/lib/langchain/chatModel";

export const useTransformQueryChain = () => {
  const llm = useChatModel();
  return historyAwareTransformQueryChain(llm);
};
