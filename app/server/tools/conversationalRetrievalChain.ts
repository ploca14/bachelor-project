import { Runnable } from "@langchain/core/runnables";
import type { RetrieverFactory } from "~/server/lib/langchain/retrieverFactory";
import type { CondenseHistoryChain } from "~/server/tools/condenseHistoryChain";
import type { TransformQueryChain } from "~/server/tools/transformQueryChain";
import type { GenerateAnswerChain } from "~/server/tools/generateAnswerChain";
import type { Conversation } from "~/server/domain/conversation";

import { RunnablePassthrough, RunnableLambda } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { formatDocumentsAsString } from "langchain/util/document";

export type ConversationalRetrievalChain = Runnable<Conversation, string>;

const NUMBER_OF_RELEVANT_DOCUMENTS = 10;

export const simpleConversationalRetrievalChain = (
  retrieverFactory: RetrieverFactory,
  condenseHistoryChain: CondenseHistoryChain,
  transformQueryChain: TransformQueryChain,
  generateAnswerChain: GenerateAnswerChain,
): ConversationalRetrievalChain => {
  // 1. Parse input
  const parseInput = RunnableLambda.from((conversation: Conversation) => {
    const { lastMessage, previousMessages } = conversation;

    return {
      question: lastMessage?.content,
      chat_history: previousMessages.map((message) => {
        if (message.role === "human") {
          return new HumanMessage(message.content);
        }
        return new AIMessage(message.content);
      }),
      conversation,
    };
  });

  // 2. Condense history
  const condenseHistory = RunnablePassthrough.assign({
    chat_history: (input: { chat_history: BaseMessage[] }) => {
      return condenseHistoryChain.invoke(input.chat_history);
    },
  });

  // 3. Retrieve relevant chunks
  const retrieveChunks = RunnablePassthrough.assign({
    context: (input: {
      conversation: Conversation;
      chat_history: BaseMessage[];
      question: string;
    }) => {
      const retriever = retrieverFactory.createForConversation(
        input.conversation,
        NUMBER_OF_RELEVANT_DOCUMENTS,
      );

      return transformQueryChain
        .pipe(retriever)
        .pipe(formatDocumentsAsString)
        .invoke(input);
    },
  });

  // 4. Generate answer
  const generateAnswer = generateAnswerChain;

  // Construct the chain:
  return parseInput
    .pipe(condenseHistory)
    .pipe(retrieveChunks)
    .pipe(generateAnswer);
};

/* v8 ignore start */
import { useRetrieverFactory } from "~/server/lib/langchain/retrieverFactory";
import { useCondenseHistoryChain } from "~/server/tools/condenseHistoryChain";
import { useTransformQueryChain } from "~/server/tools/transformQueryChain";
import { useGenerateAnswerChain } from "~/server/tools/generateAnswerChain";

export const useConversationalRetrievalChain = () => {
  const retreiverFactory = useRetrieverFactory();
  const condenseHistoryChain = useCondenseHistoryChain();
  const transformQueryChain = useTransformQueryChain();
  const generateAnswerChain = useGenerateAnswerChain();

  return simpleConversationalRetrievalChain(
    retreiverFactory,
    condenseHistoryChain,
    transformQueryChain,
    generateAnswerChain,
  );
};
