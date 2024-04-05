import type { ConversationRepository } from "~/server/repositories/conversationRepository";

const deleteConversationCommandHandler = (
  conversationRepository: ConversationRepository,
) => {
  const execute = async (deckId: string) => {
    await conversationRepository.remove(deckId);
  };

  return { execute };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";

export const useDeleteConversationCommandHandler = () => {
  const conversationRepository = useConversationRepository();

  return deleteConversationCommandHandler(conversationRepository);
};
