import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { AnswerGeneratorService } from "~/server/services/answerGeneratorService";

export interface SendMessageToConversationCommandHandler {
  execute: (
    conversationId: string,
    question: string,
  ) => Promise<ReadableStream>;
}

export const sendMessageToConversationCommandHandler = (
  conversationRepository: ConversationRepository,
  answerGeneratorService: AnswerGeneratorService,
): SendMessageToConversationCommandHandler => {
  const execute = async (conversationId: string, question: string) => {
    const conversation =
      await conversationRepository.getConversationById(conversationId);

    conversation.addHumanMessage(question);

    const stream = new ReadableStream({
      start(controller) {
        answerGeneratorService.generateAnswer(conversation, {
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
import { useAnswerGeneratorService } from "~/server/services/answerGeneratorService";

export const useSendMessageToConversationCommandHandler = () => {
  const conversationRepository = useConversationRepository();
  const answerGeneratorService = useAnswerGeneratorService();

  return sendMessageToConversationCommandHandler(
    conversationRepository,
    answerGeneratorService,
  );
};
