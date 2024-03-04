import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { AnswerGeneratorService } from "~/server/services/answerGeneratorService";

const sendMessageToConversationCommandHandler = (
  conversationRepository: ConversationRepository,
  answerGeneratorService: AnswerGeneratorService,
) => {
  const execute = async (conversationId: string, question: string) => {
    const conversation =
      await conversationRepository.getConversationById(conversationId);

    conversation.addHumanMessage(question);

    const stream = answerGeneratorService.generateAnswer(conversation, {
      onEnd: async (answer) => {
        conversation.addAiMessage(answer);
        await conversationRepository.save(conversation);
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
