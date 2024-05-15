import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { Security } from "~/server/tools/security";
import type { CollectionService } from "~/server/services/collectionService";

export interface CreateConversationForCollectionCommandHandler {
  execute: (collectionId: string) => Promise<string>;
}

export const createConversationForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  conversationRepository: ConversationRepository,
  security: Security,
  collectionService: CollectionService,
): CreateConversationForCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await security.getUser();
    const conversation = collectionService.createConversation(
      collection,
      user.id,
    );

    await conversationRepository.save(conversation);

    return conversation.id;
  };

  return { execute };
};

/* v8 ignore start */
import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurity } from "~/server/tools/security";
import { useCollectionService } from "~/server/services/collectionService";

export const useCreateConversationForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const conversationRepository = useConversationRepository();
  const security = useSecurity();
  const collectionService = useCollectionService();

  return createConversationForCollectionCommandHandler(
    collectionRepository,
    conversationRepository,
    security,
    collectionService,
  );
};
