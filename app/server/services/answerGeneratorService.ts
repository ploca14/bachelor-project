import type { Conversation } from "~/server/domain/conversation";
import type { ConversationalRetrievalChain } from "~/server/lib/langchain/conversationalRetrievalChain";

interface Callbacks {
  onProgress: (chunk: string) => Promise<void>;
  onSuccess: (answer: string) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export interface AnswerGeneratorService {
  generateAnswer(
    conversation: Conversation,
    callbacks: Callbacks,
  ): Promise<void>;
}

export const langchainAnswerGeneratorService = (
  conversationalRetrievalChain: ConversationalRetrievalChain,
): AnswerGeneratorService => {
  const generateAnswer = async (
    conversation: Conversation,
    callbacks: Callbacks,
  ) => {
    try {
      const stream = await conversationalRetrievalChain.stream(conversation);

      let completion = "";
      for await (const chunk of stream) {
        completion += chunk;
        callbacks.onProgress(chunk);
      }

      await callbacks.onSuccess(completion);
    } catch (error) {
      if (error instanceof Error) {
        await callbacks.onError(error);
      }
    }
  };

  return {
    generateAnswer,
  };
};

import { useConversationalRetrievalChain } from "~/server/lib/langchain/conversationalRetrievalChain";

export const useAnswerGeneratorService = () => {
  const conversationalRetrievalChain = useConversationalRetrievalChain();

  return langchainAnswerGeneratorService(conversationalRetrievalChain);
};
