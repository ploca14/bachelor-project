import { Conversation } from "~/server/domain/conversation";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";
import { NoFilesError } from "~/types/errors";

const createConversationForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  conversationRepository: ConversationRepository,
  securityService: SecurityService,
) => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    if (collection.fileIds.length === 0) {
      throw new NoFilesError(
        "Cannot create a conversation for empty collection.",
      );
    }

    const user = await securityService.getUser();
    const conversation = new Conversation(
      collection.name,
      collection.fileIds,
      user.id,
    );

    await conversationRepository.save(conversation);

    return conversation.id;
  };

  return { execute };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurityService } from "~/server/services/securityService";

export const useCreateConversationForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const conversationRepository = useConversationRepository();
  const securityService = useSecurityService();

  return createConversationForCollectionCommandHandler(
    collectionRepository,
    conversationRepository,
    securityService,
  );
};
