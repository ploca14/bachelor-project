import { Conversation } from "~/server/domain/conversation";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { Security } from "~/server/tools/security";
import { NoFilesError } from "~/types/errors";

export interface CreateConversationForCollectionCommandHandler {
  execute: (collectionId: string) => Promise<string>;
}

export const createConversationForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  conversationRepository: ConversationRepository,
  security: Security,
): CreateConversationForCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    if (collection.fileIds.length === 0) {
      throw new NoFilesError(
        "Cannot create a conversation for empty collection.",
      );
    }

    const user = await security.getUser();
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
import { useSecurity } from "~/server/tools/security";

export const useCreateConversationForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const conversationRepository = useConversationRepository();
  const security = useSecurity();

  return createConversationForCollectionCommandHandler(
    collectionRepository,
    conversationRepository,
    security,
  );
};
