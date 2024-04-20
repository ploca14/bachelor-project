import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { AnswerGenerator } from "~/server/tools/answerGenerator";

export interface SendMessageToConversationCommandHandler {
  execute: (
    conversationId: string,
    question: string,
  ) => Promise<ReadableStream>;
}

export const sendMessageToConversationCommandHandler = (
  conversationRepository: ConversationRepository,
  answerGenerator: AnswerGenerator,
): SendMessageToConversationCommandHandler => {
  const execute = async (conversationId: string, question: string) => {
    const conversation =
      await conversationRepository.getConversationById(conversationId);

    conversation.addHumanMessage(question);

    const stream = new ReadableStream({
      start(controller) {
        answerGenerator.generateAnswer(conversation, {
          async onProgress(chunk) {
            controller.enqueue(chunk);
          },
          async onSuccess(answer) {
            conversation.addAiMessage(answer);
            await conversationRepository.save(conversation);
            controller.close();
          },
          async onError(error) {
            controller.error(error);
          },
        });
      },
    });

    return stream;
  };

  return { execute };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useAnswerGenerator } from "~/server/tools/answerGenerator";

export const useSendMessageToConversationCommandHandler = () => {
  const conversationRepository = useConversationRepository();
  const answerGenerator = useAnswerGenerator();

  return sendMessageToConversationCommandHandler(
    conversationRepository,
    answerGenerator,
  );
};
