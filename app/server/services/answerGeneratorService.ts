import type { Conversation } from "~/server/domain/conversation";
import type { RetrieverFilterFactory } from "~/server/lib/langchain/retrieverFilterFactory";
import type { CondenseHistoryChain } from "~/server/lib/langchain/condenseHistoryChain";
import type { TransformQueryChain } from "~/server/lib/langchain/transformQueryChain";
import type { GenerateAnswerChain } from "~/server/lib/langchain/generateAnswerChain";

import { RunnablePassthrough, RunnableLambda } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { formatDocumentsAsString } from "langchain/util/document";
import type { VectorStore } from "@langchain/core/vectorstores";

export interface AnswerGeneratorService {
  generateAnswer(
    conversation: Conversation,
    callbacks?: { onEnd?: (answer: string) => void },
  ): Promise<ReadableStream<string>>;
}

const NUMBER_OF_RELEVANT_DOCUMENTS = 10;

const langchainAnswerGeneratorService = (
  store: VectorStore,
  retrieverFilterFactory: RetrieverFilterFactory,
  condenseHistoryChain: CondenseHistoryChain,
  transformQueryChain: TransformQueryChain,
  generateAnswerChain: GenerateAnswerChain,
): AnswerGeneratorService => {
  const generateAnswer = async (
    conversation: Conversation,
    callbacks?: { onEnd: (answer?: string) => Promise<void> },
  ) => {
    // 1. Parse input
    const parseInput = RunnableLambda.from((conversation: Conversation) => {
      const lastMessage = conversation.getLastMessage();
      const previousMessages = conversation.getPreviousMessages();

      return {
        question: lastMessage?.content,
        chat_history: previousMessages.map((message) => {
          if (message.role === "human") {
            return new HumanMessage(message.content);
          }
          return new AIMessage(message.content);
        }),
      };
    });

    // 2. Condense history
    const condenseHistory = RunnablePassthrough.assign({
      chat_history: (input: { chat_history: BaseMessage[] }) => {
        return condenseHistoryChain.invoke(input.chat_history);
      },
    });

    // 3. Retrieve documents
    const filter = retrieverFilterFactory.createForConversation(conversation);

    const retriever = store.asRetriever({
      k: NUMBER_OF_RELEVANT_DOCUMENTS,
      filter,
    });

    const retrieveDocs = RunnablePassthrough.assign({
      context: transformQueryChain
        .pipe(retriever)
        .pipe(formatDocumentsAsString),
    });

    // 4. Generate answer
    const generateAnswer = generateAnswerChain;

    // Construct the chain:
    const conversationalRetrievalChain = parseInput
      .pipe(condenseHistory)
      .pipe(retrieveDocs)
      .pipe(generateAnswer);

    const chain = conversationalRetrievalChain.withListeners({
      onEnd: ({ outputs }) => callbacks?.onEnd?.(outputs?.output),
    });

    return chain.stream(conversation);
  };

  return {
    generateAnswer,
  };
};

import { useVectorStore } from "~/server/lib/langchain/vectorStore";
import { useRetrieverFilterFactory } from "~/server/lib/langchain/retrieverFilterFactory";
import { useCondenseHistoryChain } from "~/server/lib/langchain/condenseHistoryChain";
import { useTransformQueryChain } from "~/server/lib/langchain/transformQueryChain";
import { useGenerateAnswerChain } from "~/server/lib/langchain/generateAnswerChain";

export const useAnswerGeneratorService = () => {
  const store = useVectorStore();
  const filterFactory = useRetrieverFilterFactory();
  const condenseHistoryChain = useCondenseHistoryChain();
  const transformQueryChain = useTransformQueryChain();
  const generateAnswerChain = useGenerateAnswerChain();

  return langchainAnswerGeneratorService(
    store,
    filterFactory,
    condenseHistoryChain,
    transformQueryChain,
    generateAnswerChain,
  );
};
