import type { Conversation } from "~/server/domain/conversation";
import type { ConversationalRetrievalChain } from "~/server/tools/conversationalRetrievalChain";

interface Callbacks {
  onProgress: (chunk: string) => Promise<void>;
  onSuccess: (answer: string) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export interface AnswerGenerator {
  generateAnswer(
    conversation: Conversation,
    callbacks: Callbacks,
  ): Promise<void>;
}

export const langchainAnswerGenerator = (
  conversationalRetrievalChain: ConversationalRetrievalChain,
): AnswerGenerator => {
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

/* v8 ignore start */
import { useConversationalRetrievalChain } from "~/server/tools/conversationalRetrievalChain";

export const useAnswerGenerator = () => {
  const conversationalRetrievalChain = useConversationalRetrievalChain();

  return langchainAnswerGenerator(conversationalRetrievalChain);
};
