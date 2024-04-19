import { Conversation } from "~/server/domain/conversation";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";

export const createConversationForFileCommandHandler = (
  fileRepository: FileRepository,
  conversationRepository: ConversationRepository,
  securityService: SecurityService,
) => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const conversation = new Conversation(file.originalName, [fileId], user.id);

    await conversationRepository.save(conversation);

    return conversation.id;
  };

  return { execute };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";

export const useCreateConversationForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const conversationRepository = useConversationRepository();
  const securityService = useSecurityService();

  return createConversationForFileCommandHandler(
    fileRepository,
    conversationRepository,
    securityService,
  );
};
