import { Conversation } from "~/server/domain/conversation";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { Security } from "~/server/tools/security";

export interface CreateConversationForFileCommandHandler {
  execute: (fileId: string) => Promise<string>;
}

export const createConversationForFileCommandHandler = (
  fileRepository: FileRepository,
  conversationRepository: ConversationRepository,
  security: Security,
): CreateConversationForFileCommandHandler => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await security.getUser();
    const conversation = new Conversation(file.originalName, [fileId], user.id);

    await conversationRepository.save(conversation);

    return conversation.id;
  };

  return { execute };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurity } from "~/server/tools/security";

export const useCreateConversationForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const conversationRepository = useConversationRepository();
  const security = useSecurity();

  return createConversationForFileCommandHandler(
    fileRepository,
    conversationRepository,
    security,
  );
};
