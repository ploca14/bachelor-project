import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { Security } from "~/server/tools/security";
import type { FileService } from "~/server/services/fileService";

export interface CreateConversationForFileCommandHandler {
  execute: (fileId: string) => Promise<string>;
}

export const createConversationForFileCommandHandler = (
  fileRepository: FileRepository,
  conversationRepository: ConversationRepository,
  security: Security,
  fileService: FileService,
): CreateConversationForFileCommandHandler => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await security.getUser();
    const conversation = fileService.createConversation(file, user.id);

    await conversationRepository.save(conversation);

    return conversation.id;
  };

  return { execute };
};

/* v8 ignore start */
import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurity } from "~/server/tools/security";
import { useFileService } from "~/server/services/fileService";

export const useCreateConversationForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const conversationRepository = useConversationRepository();
  const security = useSecurity();
  const fileService = useFileService();

  return createConversationForFileCommandHandler(
    fileRepository,
    conversationRepository,
    security,
    fileService,
  );
};
